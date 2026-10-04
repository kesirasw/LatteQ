import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  fullyParallel: true,
  use: {
    baseURL: undefined,
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: ['**/toolshop/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // The Toolshop demo is shared and public: under 4+ parallel workers it returns "Login failed" and blank pages
      // (KB §14). Two workers keep the load reasonable without retries or longer timeouts.
      name: 'toolshop',
      testMatch: ['**/toolshop/**/*.spec.ts'],
      workers: 2,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
