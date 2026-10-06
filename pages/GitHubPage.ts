import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class GitHubPage {
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly results: Locator;
  readonly issueFilter: Locator;
  readonly issues: Locator;
  readonly signInLink: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    // The header search is a button that opens the "Quick search" dialog
    this.searchButton = page.getByRole('button', { name: /^Search or jump to/ });
    this.searchInput = page
      .getByRole('dialog', { name: 'Quick search' })
      .getByRole('combobox', { name: 'Search or jump to' });
    this.results = page.getByTestId('results-list').getByRole('heading', { level: 3 });
    this.issueFilter = page.getByRole('combobox', { name: 'Search issues' });
    this.issues = page.getByRole('list', { name: 'Issues', exact: true }).getByRole('listitem');
    this.signInLink = page.getByRole('banner').getByRole('link', { name: 'Sign in', exact: true });
  }

  /** Sign in with username/password (accounts with 2FA need a manual step). */
  async login(username: string, password: string) {
    await this.actions.stableNavigate(new URL('login', ENV.GITHUB_URL).toString());
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Username or email address' }), username);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Password' }), password);
    await this.actions.safeClick(this.page.getByRole('button', { name: 'Sign in', exact: true }));
    await expect(this.page).not.toHaveURL(/\/(login|session)/);
  }

  /** Open the GitHub home page. */
  async open() {
    await this.actions.stableNavigate(ENV.GITHUB_URL);
    await expect(this.searchButton).toBeVisible();
  }

  /** Search repositories from the header quick-search dialog. */
  async search(term: string) {
    await this.actions.safeClick(this.searchButton);
    await this.actions.safeFill(this.searchInput, term);
    await this.actions.safePress(this.searchInput, 'Enter');
    await expect(this.page).toHaveURL(/\/search\?q=/);
    await expect(this.results.first()).toBeVisible();
  }

  /** Open a repository from the search results by its full name (owner/repo). */
  async openRepoResult(fullName: string) {
    const repoLink = this.results.getByRole('link', { name: fullName, exact: true });
    const repoUrl = new RegExp(`/${fullName}$`);
    await expect(repoLink).toBeVisible();
    // Under load the results list is still hydrating and the first click can be swallowed;
    // retry the click until navigation actually happens.
    await expect(async () => {
      if (repoUrl.test(this.page.url())) return;
      await repoLink.click({ timeout: ENV.SHORT_TIMEOUT });
      await expect(this.page).toHaveURL(repoUrl, { timeout: ENV.SHORT_TIMEOUT });
    }).toPass({ timeout: ENV.LONG_TIMEOUT });
  }

  /** Go to the repo's Issues tab and apply a filter query. */
  async goToIssuesAndFilter(filterQuery: string) {
    const repoNav = this.page.getByRole('navigation', { name: 'Repository', exact: true });
    await this.actions.safeClick(repoNav.getByRole('link', { name: /^Issues/ }));
    await expect(this.issueFilter).toBeVisible();
    const submit = this.page
      .getByRole('form', { name: 'Search issues' })
      .getByRole('button', { name: 'Search', exact: true });
    const filtered = (url: URL) => url.searchParams.get('q') === filterQuery;
    // The filter is a custom React input that ignores fill(), so select-all and type like a user
    // (raw pressSequentially: Actions.safeType clicks first, which would drop the selection).
    // While the page hydrates, typed text can be reset or the submit ignored, so retry until the URL carries the query.
    await expect(async () => {
      if (filtered(new URL(this.page.url()))) return;
      await this.issueFilter.click({ timeout: ENV.SHORT_TIMEOUT });
      await this.issueFilter.press('ControlOrMeta+a');
      await this.issueFilter.pressSequentially(filterQuery);
      await expect(this.issueFilter).toHaveValue(filterQuery, { timeout: ENV.SHORT_TIMEOUT });
      await submit.click({ timeout: ENV.SHORT_TIMEOUT });
      await expect(this.page).toHaveURL(filtered, { timeout: ENV.SHORT_TIMEOUT });
    }).toPass({ timeout: ENV.LONG_TIMEOUT });
  }
}
