import fs from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Optional local .env (git-ignored): GH_USER / GH_PASS and *_URL overrides, read by data/env.ts.
// Variables already set in the shell are kept.
if (fs.existsSync('.env')) process.loadEnvFile('.env');

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
