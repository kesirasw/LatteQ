import { test } from '../../fixtures/test';
import { ENV } from '../../data/env';

test('Booking: searching a destination shows property results @flaky-site', async ({ booking }) => {
  test.fixme(
    true,
    'Booking.com bot check (HTTP 202 + reload) wipes typed input in headless Chromium — failed 3/3 runs on 2026-10-04. See TEST_FIXES_KNOWLEDGE_BASE.md §8.',
  );

  await booking.open();
  await booking.setDestination(ENV.TEST_KEYWORDS.booking);
  await booking.clickSearch();

  await booking.assertResults();
});
