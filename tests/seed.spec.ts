import { test, expect } from '../fixtures/test';

// Seed for the Playwright planner/generator agents: generated tests start from LatteQ's fixtures.
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.
    await expect(page).toHaveURL('about:blank');
  });
});
