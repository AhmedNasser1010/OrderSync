import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ordersync/order-utils": path.resolve(
        __dirname,
        "../packages/order-utils/src/index.ts"
      ),
      "@ordersync/types": path.resolve(
        __dirname,
        "../packages/types/src/index.ts"
      ),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/utils/**/*.ts",
        "src/rtk/slices/**/*.ts",
        "src/lib/**/*.ts",
        "src/hooks/**/*.{ts,tsx}",
      ],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/index.ts"],
    },
  },
});
