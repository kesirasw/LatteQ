import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class BookingPage {
  readonly destinationInput: Locator;
  readonly searchButton: Locator;
  readonly propertyCards: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    const searchForm = page.getByRole('region', { name: 'Search properties' });
    this.destinationInput = searchForm.getByRole('combobox', { name: 'Enter destination' });
    this.searchButton = searchForm.getByRole('button', { name: 'Search', exact: true });
    this.propertyCards = page.getByTestId('property-card');
  }

  /** Open the home page; Booking runs a bot check (HTTP 202 + reload) before the form is usable. */
  async open() {
    await this.actions.stableNavigate(ENV.BOOKING_URL);
    await expect(this.destinationInput).toBeVisible({ timeout: ENV.LONG_TIMEOUT });
  }

  /** Type a destination and pick the first matching autocomplete suggestion. */
  async setDestination(destination: string) {
    await this.actions.safeFill(this.destinationInput, destination);
    await this.actions.safeClick(this.page.getByRole('option', { name: new RegExp(destination) }).first());
  }

  /** Submit the search form. */
  async clickSearch() {
    await this.actions.safeClick(this.searchButton);
  }

  /** Assert the results page loaded with at least one property. */
  async assertResults() {
    await expect(this.page).toHaveURL(/searchresults/i);
    await expect(this.propertyCards).not.toHaveCount(0);
  }
}
