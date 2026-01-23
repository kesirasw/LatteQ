import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class DataTablesPage {
  readonly table: Locator;
  readonly searchBox: Locator;

  constructor(private readonly page: Page, private readonly actions: Actions) {
    this.table = page.locator('#example');
    this.searchBox = page.locator('input[type="search"]');
  }

  async open() {
    await this.actions.stableNavigate('https://datatables.net/examples/basic_init/zero_configuration.html');
    await expect(this.table).toBeVisible();
  }

  async search(term: string) {
    await this.actions.safeFill(this.searchBox, term);
  }

  async sortByHeader(headerText: string) {
    const header = this.page.getByRole('columnheader', { name: headerText });
    await this.actions.safeClick(header);
  }
}
