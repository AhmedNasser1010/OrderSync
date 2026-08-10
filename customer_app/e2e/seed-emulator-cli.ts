import { seedEmulator } from "./seed-emulator.ts";

seedEmulator()
  .then(() => {
    console.log("[seed-emulator] seeded emulator data");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[seed-emulator] failed:", error);
    process.exit(1);
  });
