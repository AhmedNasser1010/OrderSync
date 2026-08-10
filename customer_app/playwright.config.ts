import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 90_000,
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: "http://localhost:3006",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `bash -c 'pkill -f "cloud-firestore-emulat[o]r" 2>/dev/null; pkill -f "firebase-auth-emulat[o]r" 2>/dev/null; sleep 1; npx firebase-tools emulators:exec --only auth,firestore --project pos-system-0 "npx esbuild e2e/seed-emulator-cli.ts --bundle --platform=node --format=cjs --packages=external --outfile=node_modules/.cache/e2e-seed.cjs && node node_modules/.cache/e2e-seed.cjs && PORT=3006 next dev"'`,
    url: "http://localhost:3006",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR: "true",
      NEXT_PUBLIC_FIREBASE_API: "e2e-emulator-api-key",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    },
  },
});
