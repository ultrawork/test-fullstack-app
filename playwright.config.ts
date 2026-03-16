import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 2,
  timeout: 30000,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4000',
    trace: 'on-first-retry',
    actionTimeout: 10000,
  },
  reporter: [['junit', { outputFile: 'test-results/results.xml' }]],
});
