import "dotenv/config";

import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./serviceAccount.json";
import { deserialize } from "./deserializer.js";
import { exportFirestore } from "./exportFirestore.js";

// -----------------------------------------------------------------------------
// Environment
// -----------------------------------------------------------------------------

process.env.USE_FIRESTORE_EMULATOR = "true";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.GCLOUD_PROJECT ??= serviceAccount.project_id;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, "clone-data", "firestore.jsonl");

// -----------------------------------------------------------------------------
// Firebase Admin
// -----------------------------------------------------------------------------

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId: serviceAccount.project_id,
  });
}

const db = getFirestore();

console.log("Emulator host:", process.env.FIRESTORE_EMULATOR_HOST);
console.log("Project ID:", getApps()[0].options.projectId);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function ensureEmulatorConnection() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;

  if (!host) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set.");
  }

  console.log(`Firestore Emulator: ${host}`);
  console.log(`Project ID: ${serviceAccount.project_id}`);
}

async function ensureInputFile() {
  try {
    await access(INPUT_FILE);
  } catch {
    console.log("No export found. Exporting Firestore first...\n");
    await exportFirestore();
  }
}

// -----------------------------------------------------------------------------
// Import
// -----------------------------------------------------------------------------

export async function importFirestore() {
  ensureEmulatorConnection();

  await ensureInputFile();

  const text = await readFile(INPUT_FILE, "utf8");
  const lines = text.split("\n").filter(Boolean);

  console.log(`Importing ${lines.length} documents...\n`);

  let batch = db.batch();
  let writes = 0;
  let imported = 0;

  for (const line of lines) {
    const { path, data } = JSON.parse(line);

    batch.set(db.doc(path), deserialize(data));

    writes++;
    imported++;

    if (writes === 500) {
      await batch.commit();

      console.log(`✓ Imported ${imported}/${lines.length}`);

      batch = db.batch();
      writes = 0;
    }
  }

  if (writes > 0) {
    await batch.commit();
  }

  console.log(`✓ Imported ${imported}/${lines.length}`);

  if (imported === 0) {
    console.log("Verification: SKIPPED (no documents imported)");
    console.log("\n✅ Firestore import complete.");
    return;
  }

  // Verify import
  const snapshot = await db.collection("users").limit(1).get();

  console.log(
    `Verification: ${snapshot.empty ? "FAILED" : "PASSED"} (${snapshot.size} user found)`,
  );

  console.log("\n✅ Firestore import complete.");
}

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  importFirestore().catch(console.error);
}
