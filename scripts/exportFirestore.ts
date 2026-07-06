import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { productionDb } from "./firebaseAdmin.js";
import { serialize } from "./serializer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, "clone-data");
const OUTPUT_FILE = join(OUTPUT_DIR, "firestore.jsonl");

async function exportCollection(
  path: string,
  lines: string[],
  documentCountRef: { current: number },
) {
  const snapshot = await productionDb.collection(path).get();

  for (const doc of snapshot.docs) {
    lines.push(
      JSON.stringify({
        path: doc.ref.path,
        data: serialize(doc.data()),
      }),
    );

    documentCountRef.current += 1;

    const subcollections = await doc.ref.listCollections();

    for (const sub of subcollections) {
      await exportCollection(sub.path, lines, documentCountRef);
    }
  }
}

export async function exportFirestore() {
  const lines: string[] = [];
  const documentCountRef = { current: 0 };

  await mkdir(OUTPUT_DIR, { recursive: true });

  const collections = await productionDb.listCollections();

  for (const collection of collections) {
    console.log(`Exporting ${collection.id}...`);
    await exportCollection(collection.path, lines, documentCountRef);
  }

  await writeFile(OUTPUT_FILE, lines.join("\n"));

  await writeFile(
    join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        documents: documentCountRef.current,
      },
      null,
      2,
    ),
  );

  console.log();
  console.log(`✓ Exported ${documentCountRef.current} documents`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  exportFirestore().catch(console.error);
}
