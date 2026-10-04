import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import { getColumnText } from '../utils/table';

export class DataTablesPage {
  readonly table: Locator;
  readonly searchBox: Locator;
  readonly rows: Locator;
  readonly status: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    // #example is the demo's authored table id (not generated)
    this.table = page.locator('#example');
    this.searchBox = page.getByRole('searchbox', { name: 'Search:' });
    this.rows = this.table.locator('tbody tr');
    this.status = page.getByRole('status');
  }

  /** Open the zero-configuration example and wait for the table. */
  async open() {
    await this.actions.stableNavigate(ENV.DATATABLES_URL);
    await expect(this.page).toHaveURL(/zero_configuration/);
    await expect(this.table).toBeVisible();
  }

  /** Filter rows with the global search box. */
  async search(term: string) {
    await this.actions.safeFill(this.searchBox, term);
    await expect(this.status).toContainText('filtered from');
  }

  /** Click a column's sort button in the header (the footer cells are not sortable). */
  async sortByHeader(headerText: string) {
    const sortButton = this.table.getByRole('button', { name: new RegExp(`^${headerText}: Activate to`) });
    await this.actions.safeClick(sortButton);
    await expect(this.table.getByRole('columnheader', { name: new RegExp(`^${headerText} `) })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  }

  /** Read the visible text of a column (1-based index). */
  async getColumn(colIndex1Based: number): Promise<string[]> {
    return getColumnText(this.table, colIndex1Based);
  }
}
