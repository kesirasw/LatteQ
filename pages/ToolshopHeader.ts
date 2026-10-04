import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

// Locators from ui-context/toolshop/MAP.md (Header). Composed into every Toolshop page object.
export class ToolshopHeader {
  readonly signInLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;
  readonly signOutItem: Locator;
  readonly alert: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.cartLink = page.getByRole('link', { name: 'cart' });
    // No accessible name on the badge
    this.cartQuantity = page.locator('[data-test="cart-quantity"]');
    // "Sign out" is an <a> without href, so it has no link role (MAP A4)
    this.signOutItem = page.getByText('Sign out', { exact: true });
    // Transient toasts (cart, favourites, delete)
    this.alert = page.getByRole('alert');
  }

  /** The user menu button, labelled with the signed-in customer's name. */
  userMenu(fullName: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${fullName}`) });
  }

  /** Sign out through the user menu. */
  async signOut(fullName: string) {
    await this.actions.safeClick(this.userMenu(fullName));
    await this.actions.safeClick(this.signOutItem);
    await expect(this.signInLink).toBeVisible();
  }
}
