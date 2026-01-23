const { test, expect } = require('@playwright/test');

test.describe('Example Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page before each test
    await page.goto('https://example.com');
  });

  test('should have title', async ({ page }) => {
    // Expect a title "to contain" a substring
    await expect(page).toHaveTitle(/Example/);
  });

  test('should find heading', async ({ page }) => {
    // Locate by role
    const heading = await page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should take screenshot', async ({ page }) => {
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/example.png' });
  });
});

test.describe('API Testing Example', () => {
  test('should make API request', async ({ request }) => {
    const response = await request.get('https://api.example.com/data');
    expect(response.status()).toBe(200);
  });
});
