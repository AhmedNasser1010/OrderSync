import "dotenv/config";

import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { initializeApp, cert, getApps, deleteApp } from "firebase-admin/app";
import { getAuth, UserImportOptions, UserImportRecord } from "firebase-admin/auth";

import serviceAccount from "./serviceAccount.json";

// -----------------------------------------------------------------------------
// Environment
// NOTE: firebaseAdmin.ts deletes FIREBASE_AUTH_EMULATOR_HOST.
// We must set it AFTER importing anything that triggers firebaseAdmin.ts,
// and we must initialize our OWN Firebase app (not reuse the one from firebaseAdmin.ts).
// -----------------------------------------------------------------------------

process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, "clone-data", "auth.jsonl");
const DEFAULT_PASSWORD = "123456";

// -----------------------------------------------------------------------------
// Firebase Admin - initialize our OWN app pointing at the emulator
// -----------------------------------------------------------------------------

// Delete any existing default app (from firebaseAdmin.ts) as it's configured for production
const existingApps = getApps();
for (const existingApp of existingApps) {
  await deleteApp(existingApp);
}

const app = initializeApp({
  credential: cert(serviceAccount as Parameters<typeof cert>[0]),
  projectId: serviceAccount.project_id,
});

const auth = getAuth(app);

console.log("Auth Emulator:", process.env.FIREBASE_AUTH_EMULATOR_HOST);
console.log("Project ID:", app.options.projectId);
console.log();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function ensureInputFile() {
  try {
    await access(INPUT_FILE);
  } catch {
    console.log("No auth export found. Exporting Auth from production first...\n");
    // Dynamically import exportAuth so firebaseAdmin.ts runs fresh for production
    const { exportAuth } = await import("./exportAuth.js");
    await exportAuth();
  }
}

interface ExportedAuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  disabled: boolean;
  passwordHash: string | null;
  passwordSalt: string | null;
  providerData: Array<{
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }>;
  customClaims: Record<string, any> | null;
  createdAt: string;
  lastLoginAt: string | null;
}

async function readExportedAuthUsers(): Promise<ExportedAuthUser[]> {
  const text = await readFile(INPUT_FILE, "utf8");
  const lines = text.split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function importAuth() {
  await ensureInputFile();

  console.log("Reading exported auth data...");
  const exportedUsers = await readExportedAuthUsers();
  console.log(`Found ${exportedUsers.length} auth users to import.\n`);

  // Process in batches of 1000 (Firebase limit)
  const BATCH_SIZE = 1000;
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < exportedUsers.length; i += BATCH_SIZE) {
    const batch = exportedUsers.slice(i, i + BATCH_SIZE);
    const records: UserImportRecord[] = [];
    const options: UserImportOptions = { hash: { algorithm: "HMAC_SHA256", key: Buffer.from("secret") } };

    for (const user of batch) {
      const record: UserImportRecord = {
        uid: user.uid,
        email: user.email ?? undefined,
        emailVerified: user.emailVerified,
        displayName: user.displayName ?? undefined,
        phoneNumber: user.phoneNumber ?? undefined,
        photoURL: user.photoURL ?? undefined,
        disabled: user.disabled,
        providerData: user.providerData.map((p) => ({
          uid: p.uid,
          displayName: p.displayName ?? undefined,
          email: p.email ?? undefined,
          phoneNumber: p.phoneNumber ?? undefined,
          photoURL: p.photoURL ?? undefined,
          providerId: p.providerId,
        })),
        customClaims: user.customClaims ?? undefined,
      };

      records.push(record);
    }

    try {
      const result = await auth.importUsers(records, options);
      imported += result.successCount;
      failed += result.failureCount;

      for (const err of result.errors) {
        console.error(`  ✗ Failed to import ${batch[err.index].email ?? batch[err.index].uid}: ${err.error.message}`);
      }

      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.successCount} imported, ${result.failureCount} failed`);

      // Reset passwords for Email/Password users so they can sign in with the default
      for (const user of batch) {
        if (user.passwordHash) {
          try {
            await auth.updateUser(user.uid, { password: DEFAULT_PASSWORD });
          } catch (err: any) {
            console.error(`  ✗ Failed to set password for ${user.email ?? user.uid}: ${err.message}`);
          }
        }
      }
    } catch (error: any) {
      // If importUsers fails (e.g. emulator doesn't support hash import),
      // fall back to creating users one by one with a default password
      console.log(`  Batch import failed (${error.message}), falling back to individual creation...`);

      for (const user of batch) {
        try {
          // Check if user already exists
          try {
            await auth.getUser(user.uid);
            console.log(`  ~ Skipped (already exists): ${user.email ?? user.uid}`);
            skipped++;
            continue;
          } catch {
            // User doesn't exist, create them
          }

          await auth.createUser({
            uid: user.uid,
            email: user.email ?? undefined,
            emailVerified: user.emailVerified,
            displayName: user.displayName ?? undefined,
            phoneNumber: user.phoneNumber ?? undefined,
            photoURL: user.photoURL ?? undefined,
            disabled: user.disabled,
            password: DEFAULT_PASSWORD,
          });

          // Set custom claims if any
          if (user.customClaims) {
            await auth.setCustomUserClaims(user.uid, user.customClaims);
          }

          console.log(`  ✓ Created: ${user.email ?? user.uid}`);
          imported++;
        } catch (error: any) {
          console.error(`  ✗ Failed: ${user.email ?? user.uid}: ${error.message}`);
          failed++;
        }
      }
    }
  }

  console.log(`\n✅ Done. Imported: ${imported}, Skipped: ${skipped}, Failed: ${failed}`);

  if (failed > 0) {
    console.log("   Some users failed to import. Check the errors above.");
  }

  console.log(`\nℹ️  All Email/Password users have been set to the default password: "${DEFAULT_PASSWORD}".`);
  console.log(`   Google sign-in will also work in the emulator.`);

  // Verify users exist in the emulator
  console.log("\nVerifying users in emulator...");
  try {
    const verifyResult = await auth.listUsers(5);
    console.log(`  Emulator has ${verifyResult.users.length}+ users. Verified.`);
  } catch (error: any) {
    console.error(`  Verification failed: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  importAuth().catch(console.error);
}