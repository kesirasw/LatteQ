import { test, expect } from '../fixtures/test';

// Seed spec: new specs start from LatteQ's fixtures (see the test-standards skill).
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.
    await expect(page).toHaveURL('about:blank');
  });
});
