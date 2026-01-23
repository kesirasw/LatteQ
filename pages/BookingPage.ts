import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class BookingPage {
  readonly destinationInput: Locator;

  constructor(private readonly page: Page, private readonly actions: Actions) {
    this.destinationInput = page.getByPlaceholder(/where are you going/i);
  }

  async open() {
    await this.actions.stableNavigate('https://www.booking.com/');
    await expect(this.page).toHaveURL(/booking\.com/);
  }

  async setDestination(destination: string) {
    await this.actions.safeClick(this.destinationInput);
    await this.actions.safeFill(this.destinationInput, destination);
    const first = this.page.locator('[data-testid="autocomplete-result"]').first();
    await this.actions.safeClick(first);
  }

  async clickSearch() {
    await this.actions.safeClick(this.page.getByRole('button', { name: /search/i }));
  }

  async assertResults() {
    await expect(this.page).toHaveURL(/searchresults/i);
    const cards = this.page.locator('[data-testid="property-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  }
}
