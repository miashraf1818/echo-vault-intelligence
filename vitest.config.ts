import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest config is intentionally separate from `vite.config.ts`. The Lovable
// preset that powers `vite.config.ts` registers TanStack Start, Cloudflare,
// and other plugins that pull in Node-only modules and break under jsdom.
// This config keeps the test runner minimal: React + TS path aliases.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
  },
});
