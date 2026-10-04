import { test, expect } from '../../fixtures/test';
import { ENV } from '../../data/env';
import { isSortedAsc } from '../../utils/table';

test.describe('DataTables', () => {
  test.beforeEach(async ({ datatables }) => {
    await datatables.open();
  });

  test('DataTables: search filters rows to the matching office @smoke', async ({ datatables }) => {
    await datatables.search(ENV.TEST_KEYWORDS.datatables);

    await expect(datatables.status).toContainText('filtered from 57 total entries');
    const offices = await datatables.getColumn(3);
    expect(offices.length).toBeGreaterThan(0);
    expect(offices.every((office) => office === ENV.TEST_KEYWORDS.datatables)).toBe(true);
  });

  test('DataTables: sorting by Office orders the column ascending', async ({ datatables }) => {
    await datatables.sortByHeader('Office');

    const offices = await datatables.getColumn(3);
    expect(isSortedAsc(offices), `Office column should be ascending: ${offices.join(', ')}`).toBe(true);
  });
});
