import { test, expect } from '../../fixtures/test';
import { ENV } from '../../data/env';
import { AUTH_STATE_PATH, authStateExists, saveStorageState } from '../../utils/auth';

// Template: set GH_USER / GH_PASS (non-2FA account) to run the login once,
// then the reuse test picks up .auth/state.json.
test.describe('Auth storageState', () => {
  test('Auth: logging in once saves a reusable storage state', async ({ github, page }) => {
    test.skip(!ENV.GH_USER || !ENV.GH_PASS, 'GH_USER / GH_PASS not set');
    test.skip(authStateExists(), 'Auth state already exists. Delete .auth/state.json to re-run login.');

    await github.login(ENV.GH_USER, ENV.GH_PASS);
    await saveStorageState(page);

    expect(authStateExists()).toBe(true);
  });
});

test.describe('Auth storageState reuse', () => {
  // Only point at the state file when it exists, otherwise context creation fails before the skip runs
  test.use({ storageState: authStateExists() ? AUTH_STATE_PATH : undefined });

  test('Auth: a saved storage state starts the session signed in', async ({ github }) => {
    test.skip(!authStateExists(), 'No auth state found. Run the login test first.');

    await github.open();

    await expect(github.signInLink).toBeHidden();
  });
});
