import { test } from '../../fixtures/test';
import { ENV } from '../../data/env';

// Booking's bot check blocks Playwright's bundled Chromium but lets real Chrome through (KB §8)
test.use({ channel: 'chrome' });

test('Booking: searching a destination shows its results @flaky-site', async ({ booking }) => {
  const destination = ENV.TEST_KEYWORDS.booking;

  await booking.open();
  await booking.setDestination(destination);
  await booking.clickSearch();

  await booking.assertResults(destination);
});
