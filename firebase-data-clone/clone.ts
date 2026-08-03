import "dotenv/config";

import { exportFirestore } from "./exportFirestore.js";
import { importFirestore } from "./importFirestore.js";
import { exportAuth } from "./exportAuth.js";
import { importAuth } from "./importAuth.js";

async function main() {
  const args = process.argv.slice(2);
  const includeAuth = args.includes("--auth") || args.includes("-a");

  // 1. Export production Firestore
  console.log("=== Firestore Export ===");
  await exportFirestore();

  // 2. Import into local emulator
  console.log("\n=== Firestore Import ===");
  await importFirestore();

  if (includeAuth) {
    // 3. Export production Auth
    console.log("\n=== Auth Export ===");
    await exportAuth();

    // 4. Import into local emulator
    console.log("\n=== Auth Import ===");
    await importAuth();
  } else {
    console.log("\nℹ️  Skipping Auth export/import. Use --auth flag to include Auth users.");
    console.log("   Or run: npm run clone:auth");
  }
}

main().catch(console.error);