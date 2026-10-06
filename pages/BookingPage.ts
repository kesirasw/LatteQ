import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

// Locators from ui-context/booking/MAP.md
export class BookingPage {
  readonly signInModal: Locator;
  readonly dismissSignIn: Locator;
  readonly searchForm: Locator;
  readonly destinationInput: Locator;
  readonly suggestions: Locator;
  readonly searchButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.signInModal = page.getByRole('dialog', { name: /sign in to Booking\.com/ });
    this.dismissSignIn = page.getByRole('button', { name: 'Dismiss sign-in info.' });
    this.searchForm = page.getByRole('region', { name: 'Search properties' });
    // A/B variants name it "Enter destination" or "Search in your own words": it's the only combobox in the form
    this.destinationInput = this.searchForm.getByRole('combobox');
    this.suggestions = page.getByRole('listbox', { name: /List of suggested destinations/ });
    this.searchButton = this.searchForm.getByRole('button', { name: 'Search', exact: true });
  }

  /** Open the home page; the sign-in modal is dismissed automatically whenever it appears. */
  async open() {
    // The modal shows up at an unpredictable moment after load, so register a handler instead of a one-off click
    await this.page.addLocatorHandler(this.signInModal, async () => {
      await this.dismissSignIn.click();
    });
    await this.actions.stableNavigate(ENV.BOOKING_URL);
    await expect(this.destinationInput).toBeVisible({ timeout: ENV.LONG_TIMEOUT });
  }

  /** Type a destination and pick the first matching place (not the "Search with AI" suggestion). */
  async setDestination(destination: string) {
    // The typed value can be wiped right after load (re-render / late sign-in modal); the open listbox then
    // shows "Trending destinations" instead of suggestions. Retry until suggestions for our text appear.
    await expect(async () => {
      await this.destinationInput.fill(destination, { timeout: ENV.SHORT_TIMEOUT });
      await expect(this.destinationInput).toHaveValue(destination, { timeout: ENV.SHORT_TIMEOUT });
      await expect(this.suggestions).toBeVisible({ timeout: ENV.SHORT_TIMEOUT });
    }).toPass({ timeout: ENV.LONG_TIMEOUT });
    const place = this.suggestions
      .getByRole('option', { name: new RegExp(`^${destination}\\b`) })
      .filter({ hasNotText: 'Search with AI' })
      .first();
    await this.actions.safeClick(place);
  }

  /** Submit the search form. */
  async clickSearch() {
    await this.actions.safeClick(this.searchButton);
  }

  /** Assert the search results page for the destination: filters panel shown, search box keeps the place. */
  async assertResults(destination: string) {
    await expect(this.page).toHaveURL(/\/searchresults/);
    await expect(this.page.getByRole('region', { name: 'Filters' })).toBeVisible();
    await expect(this.destinationInput).toHaveValue(new RegExp(destination));
  }
}
