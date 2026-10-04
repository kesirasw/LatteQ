import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Catalogue, flows C1–C9)
export class ToolshopCatalogPage {
  readonly header: ToolshopHeader;
  readonly productCards: Locator;
  readonly productNameItems: Locator;
  readonly productPriceItems: Locator;
  readonly searchBox: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly searchHeading: Locator;
  readonly sort: Locator;
  readonly ecoFilter: Locator;
  readonly priceMax: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    this.productCards = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 5 }) });
    // Lists are read via data-test (no accessible names on name/price cells)
    this.productNameItems = page.locator('[data-test="product-name"]');
    this.productPriceItems = page.locator('[data-test="product-price"]');
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.searchSubmit = page.getByRole('button', { name: 'Search' });
    this.searchReset = page.getByRole('button', { name: 'X', exact: true });
    this.searchHeading = page.getByRole('heading', { name: /^Searched for:/ });
    this.sort = page.getByRole('combobox', { name: 'sort' });
    this.ecoFilter = page.getByRole('checkbox', { name: 'Show only eco-friendly products' });
    this.priceMax = page.getByRole('slider', { name: 'ngx-slider-max' });
  }

  /** Open the catalogue and wait for the product list. */
  async open() {
    await this.actions.stableNavigate(ENV.TOOLSHOP_URL);
    await expect(this.productNameItems.first()).toBeVisible();
  }

  /** Names of the products currently listed. */
  async productNames(): Promise<string[]> {
    return (await this.productNameItems.allInnerTexts()).map((n) => n.trim());
  }

  /** Prices of the products currently listed, as numbers. */
  async productPrices(): Promise<number[]> {
    return (await this.productPriceItems.allInnerTexts()).map((p) => Number(p.replace(/[^0-9.]/g, '')));
  }

  /** Active CO₂ letter (A–E) of each listed product. */
  async co2Ratings(): Promise<string[]> {
    // The rating badge has no accessible text; the active letter carries the .active class (MAP C8)
    return (await this.page.locator('[data-test="co2-rating-badge"] .co2-letter.active').allInnerTexts()).map((r) =>
      r.trim(),
    );
  }

  /** Search the catalogue. */
  async search(term: string) {
    await this.actions.safeFill(this.searchBox, term);
    await this.actions.safeClick(this.searchSubmit);
    await expect(this.searchHeading).toContainText(term);
  }

  /** Clear the current search with the X button. */
  async clearSearch() {
    await this.actions.safeClick(this.searchReset);
    await expect(this.searchHeading).toBeHidden();
  }

  /** Choose a sort order by its label, e.g. "Price (Low - High)". */
  async sortBy(label: string) {
    await this.actions.safeSelect(this.sort, label);
  }

  /** Tick a category filter. */
  async filterByCategory(name: string) {
    await this.actions.safeClick(this.page.getByRole('checkbox', { name, exact: true }));
  }

  /** Tick a brand filter. */
  async filterByBrand(name: string) {
    await this.actions.safeClick(this.page.getByRole('checkbox', { name }));
  }

  /** Tick "Show only eco-friendly products". */
  async showEcoFriendlyOnly() {
    await this.actions.safeClick(this.ecoFilter);
  }

  /** Lower the price range's upper handle by `steps` PageDown presses and return the new maximum. */
  async lowerMaxPrice(steps: number): Promise<number> {
    for (let i = 0; i < steps; i++) await this.actions.safePress(this.priceMax, 'PageDown');
    return Number(await this.priceMax.getAttribute('aria-valuenow'));
  }

  /** Go to a page of results. */
  async goToPage(n: number) {
    await this.actions.safeClick(this.page.getByRole('button', { name: `Page-${n}` }));
  }

  /** Open a product from the list by its exact name. */
  async openProduct(name: string) {
    const card = this.page
      .getByRole('link')
      .filter({ has: this.page.getByRole('heading', { level: 5, name, exact: true }) });
    await this.actions.safeClick(card);
    await expect(this.page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
  }
}
