import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { productionAuth } from "./firebaseAdmin.js";
import { Buffer } from "node:buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, "clone-data");
const OUTPUT_FILE = join(OUTPUT_DIR, "auth.jsonl");

export async function exportAuth() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const lines: string[] = [];
  let pageToken: string | undefined;
  let total = 0;

  console.log("Exporting Auth users from production...\n");

  do {
    const result = await productionAuth.listUsers(1000, pageToken);
    const users = result.users;

    for (const user of users) {
      const record = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        disabled: user.disabled,
        // Password hash and salt for Email/Password users
        passwordHash: user.passwordHash ? Buffer.from(user.passwordHash).toString("base64") : null,
        passwordSalt: user.passwordSalt ? Buffer.from(user.passwordSalt).toString("base64") : null,
        // Provider data (Google, etc.)
        providerData: user.providerData.map((p) => ({
          uid: p.uid,
          displayName: p.displayName,
          email: p.email,
          phoneNumber: p.phoneNumber,
          photoURL: p.photoURL,
          providerId: p.providerId,
        })),
        // Custom claims
        customClaims: user.customClaims ?? null,
        // Metadata
        createdAt: user.metadata.creationTime,
        lastLoginAt: user.metadata.lastSignInTime,
      };

      lines.push(JSON.stringify(record));
      total++;

      if (total % 100 === 0) {
        console.log(`  Exported ${total} users...`);
      }
    }

    pageToken = result.pageToken;
  } while (pageToken);

  await writeFile(OUTPUT_FILE, lines.join("\n"));

  console.log(`\n✅ Exported ${total} auth users`);
  console.log(`   Saved to: ${OUTPUT_FILE}`);
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  exportAuth().catch(console.error);
}