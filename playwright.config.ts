import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  reporter: [["junit", { outputFile: "test-results/results.xml" }]],
  webServer: undefined,
});
