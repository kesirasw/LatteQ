import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Product, flows P1–P5)
export class ToolshopProductPage {
  readonly header: ToolshopHeader;
  readonly title: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToFavouritesButton: Locator;
  readonly compareButton: Locator;
  readonly relatedProducts: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    this.title = page.getByRole('heading', { level: 1 });
    // No accessible name on the price
    this.unitPrice = page.locator('[data-test="unit-price"]');
    this.quantity = page.getByRole('spinbutton', { name: 'Quantity' });
    this.increaseQuantity = page.getByRole('button', { name: 'Increase quantity' });
    this.decreaseQuantity = page.getByRole('button', { name: 'Decrease quantity' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.addToFavouritesButton = page.getByRole('button', { name: /Add to favourites/ });
    this.compareButton = page.getByRole('button', { name: /Compare/ });
    this.relatedProducts = page.getByRole('heading', { name: 'Related products' });
  }

  /** Set the quantity field. */
  async setQuantity(quantity: number) {
    await this.actions.safeFill(this.quantity, String(quantity));
  }

  /** Add the product to the cart and wait for the confirmation. */
  async addToCart() {
    await this.actions.safeClick(this.addToCartButton);
    await expect(this.header.alert).toBeVisible();
  }

  /** Click "Add to favourites". */
  async addToFavourites() {
    await this.actions.safeClick(this.addToFavouritesButton);
  }

  /** Open a related product by its name. */
  async openRelatedProduct(name: string) {
    const card = this.page
      .getByRole('link')
      .filter({ has: this.page.getByRole('heading', { level: 5, name, exact: true }) });
    await this.actions.safeClick(card);
    await expect(this.page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
  }
}
