import { test, expect } from '../../fixtures/test';

test('Booking: destination + search results', async ({ booking, page }) => {
  await booking.open();
  await booking.setDestination('Melbourne');
  await booking.clickSearch();

  await expect(page).toHaveURL(/searchresults/i);
  const cards = page.locator('[data-testid="property-card"]');
  expect(await cards.count()).toBeGreaterThan(0);
});
