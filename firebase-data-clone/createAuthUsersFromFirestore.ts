import "dotenv/config";

import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "./serviceAccount.json";
import { exportFirestore } from "./exportFirestore.js";

// -----------------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------------

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, "clone-data", "firestore.jsonl");
const DEFAULT_PASSWORD = "123456";

// -----------------------------------------------------------------------------
// Firebase Admin
// -----------------------------------------------------------------------------

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId: serviceAccount.project_id,
  });
}

const auth = getAuth();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

interface AuthUserInput {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
}

async function ensureInputFile() {
  try {
    await access(INPUT_FILE);
  } catch {
    console.log("No export found. Exporting Firestore first...\n");
    await exportFirestore();
  }
}

async function readAuthUsersFromFirestore(): Promise<AuthUserInput[]> {
  const text = await readFile(INPUT_FILE, "utf8");
  const lines = text.split("\n").filter(Boolean);
  const users: AuthUserInput[] = [];
  const seenUids = new Set<string>();

  for (const line of lines) {
    const { path, data } = JSON.parse(line);

    // Match /users/{uid} or /customers/{uid} (top-level documents only)
    const match = path.match(/^(users|customers)\/([^/]+)$/);
    if (!match) continue;

    const userInfo = data.userInfo;
    if (!userInfo?.email || !userInfo?.uid) continue;

    // Avoid duplicates (same uid appearing in multiple collections)
    if (seenUids.has(userInfo.uid)) continue;
    seenUids.add(userInfo.uid);

    users.push({
      uid: userInfo.uid,
      email: userInfo.email,
      displayName: userInfo.name,
      phoneNumber: userInfo.phone,
    });
  }

  return users;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function createAuthUsersFromFirestore() {
  console.log("Auth Emulator:", process.env.FIREBASE_AUTH_EMULATOR_HOST);
  console.log("Project ID:", getApps()[0].options.projectId);
  console.log();

  await ensureInputFile();

  console.log("Reading Firestore data...");
  const users = await readAuthUsersFromFirestore();
  console.log(`Found ${users.length} users to create.\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        password: DEFAULT_PASSWORD,
        emailVerified: true,
      });
      console.log(`✓ Created: ${user.email} (${user.uid})`);
      created++;
    } catch (error: any) {
      if (error.code === "auth/uid-already-exists") {
        console.log(`~ Skipped (already exists): ${user.email} (${user.uid})`);
        skipped++;
      } else {
        console.error(`✗ Failed: ${user.email} (${user.uid}): ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  createAuthUsersFromFirestore().catch(console.error);
}