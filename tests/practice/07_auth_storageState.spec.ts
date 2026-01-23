import { test, expect } from '@playwright/test';
import { AUTH_STATE_PATH, authStateExists, saveStorageState } from '../../utils/auth';

test.describe('Auth storageState template', () => {
  test('Login once and save storageState (example)', async ({ page }) => {
    test.skip(authStateExists(), 'Auth state already exists. Delete .auth/state.json to re-run login.');

    await page.goto('https://github.com/login');
    // Fill username/password manually or via env vars (recommended)
    // await page.getByLabel('Username or email address').fill(process.env.GH_USER!);
    // await page.getByLabel('Password').fill(process.env.GH_PASS!);
    // await page.getByRole('button', { name: 'Sign in' }).click();

    // For practice: just show where to assert login success.
    // await expect(page.getByRole('link', { name: /your profile/i })).toBeVisible();

    await saveStorageState(page);
  });

  test.use({ storageState: AUTH_STATE_PATH });

  test('Reuse auth state (example)', async ({ page }) => {
    test.skip(!authStateExists(), 'No auth state found. Run the first test once.');
    await page.goto('https://github.com/');
    await expect(page).toHaveURL(/github\.com/);
  });
});
