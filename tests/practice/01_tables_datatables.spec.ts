import { test, expect } from '../../fixtures/test';
import { getColumnText, expectSortedAsc } from '../../utils/table';

test('DataTables: filter + sort + pagination', async ({ datatables, page }) => {
  await datatables.open();

  await datatables.search('London');
  const rowsAfterFilter = await page.locator('#example tbody tr').count();
  expect(rowsAfterFilter).toBeGreaterThan(0);

  await datatables.sortByHeader('Name');

  const col = await getColumnText(datatables.table, 1);
  await expectSortedAsc(col);
});
