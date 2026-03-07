import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 2,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },
  reporter: [['junit', { outputFile: 'test-results/results.xml' }]],
  webServer: {
    command: 'npm run dev -- -p 4000',
    port: 4000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
