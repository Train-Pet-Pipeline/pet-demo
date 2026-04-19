import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://127.0.0.1:3200", trace: "retain-on-failure" },
  webServer: {
    command: "bash -c 'mkdir -p public && rm -rf public/artifacts && cp -r tests/fixtures/artifacts-test public/artifacts && pnpm build && pnpm start'",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
