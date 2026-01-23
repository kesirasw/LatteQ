import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class GitHubPage {
  readonly searchBox: Locator;

  constructor(private readonly page: Page, private readonly actions: Actions) {
    this.searchBox = page.getByPlaceholder(/search or jump to/i);
  }

  async open() {
    await this.actions.stableNavigate('https://github.com/');
    await expect(this.page).toHaveURL(/github\.com/);
  }

  async search(term: string) {
    await this.actions.safeClick(this.searchBox);
    await this.actions.safeType(this.searchBox, term);
    await this.actions.safePress(this.searchBox, 'Enter');
    await expect(this.page).toHaveURL(/search/);
  }

  async openFirstRepoResult() {
    const firstRepo = this.page.locator('a.v-align-middle').first();
    await this.actions.safeClick(firstRepo);
    await expect(this.page.locator('#repository-container-header')).toBeVisible();
  }

  async goToIssuesAndFilter(filterQuery: string) {
    await this.actions.safeClick(this.page.getByRole('link', { name: 'Issues' }));
    const filterBox = this.page.getByPlaceholder(/is:issue is:open/i);
    await this.actions.safeFill(filterBox, filterQuery);
    await this.actions.safePress(filterBox, 'Enter');
    await expect(this.page).toHaveURL(/q=/);
  }
}
