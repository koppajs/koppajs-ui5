import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4178",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "pnpm vite --config ./examples/basic-koppajs-app/vite.config.mjs --host 127.0.0.1 --port 4178 --strictPort",
    url: "http://127.0.0.1:4178",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
