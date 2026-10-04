import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import { ToolshopMessages } from '../data/toolshop-data';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Checkout, flows K1–K15)
export class ToolshopCheckoutPage {
  readonly header: ToolshopHeader;
  // Step 1: cart
  readonly linePrices: Locator;
  readonly cartTotal: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingButton: Locator;
  readonly proceedButton: Locator;
  // Step 2: sign in / guest
  readonly signInTab: Locator;
  readonly guestTab: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly alreadyLoggedIn: Locator;
  readonly guestFirstName: Locator;
  readonly guestLastName: Locator;
  readonly guestSubmit: Locator;
  // Step 3: billing address
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  // Step 4: payment
  readonly paymentMethod: Locator;
  readonly checkPaymentButton: Locator;
  readonly confirmButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;
  readonly invoiceNumber: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    // No accessible names on the price cells
    this.linePrices = page.locator('[data-test="line-price"]');
    this.cartTotal = page.locator('[data-test="cart-total"]');
    this.emptyCartMessage = page.getByText(ToolshopMessages.cartEmpty);
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    this.proceedButton = page.getByRole('button', { name: 'Proceed to checkout' });

    this.signInTab = page.getByRole('tab', { name: 'Sign in' });
    this.guestTab = page.getByRole('tab', { name: 'Continue as Guest' });
    // The guest form uses the same "Email address *" label; only the active tab's form is rendered
    this.loginEmail = page.getByRole('textbox', { name: 'Email address *' });
    this.loginPassword = page.getByRole('textbox', { name: 'Password *' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.alreadyLoggedIn = page.getByText(ToolshopMessages.alreadyLoggedIn);
    this.guestFirstName = page.getByRole('textbox', { name: 'First name *' });
    this.guestLastName = page.getByRole('textbox', { name: 'Last name *' });
    this.guestSubmit = page.getByRole('button', { name: 'Continue as Guest' });

    this.country = page.getByRole('combobox', { name: 'Country' });
    this.postalCode = page.getByRole('textbox', { name: 'Postal code' });
    this.houseNumber = page.getByRole('textbox', { name: 'House number' });
    this.street = page.getByRole('textbox', { name: 'Street' });
    this.city = page.getByRole('textbox', { name: 'City' });
    this.state = page.getByRole('textbox', { name: 'State' });

    this.paymentMethod = page.getByRole('combobox', { name: 'Payment Method' });
    // Same element: renamed from "Check payment" to "Confirm" after a successful check (MAP K7)
    this.checkPaymentButton = page.getByRole('button', { name: 'Check payment' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.paymentSuccess = page.getByText(ToolshopMessages.paymentSuccess);
    this.orderConfirmation = page.getByText(ToolshopMessages.orderThanks);
    this.invoiceNumber = page.getByText(/^INV-\d+$/);
  }

  /** Open the cart (first checkout step). */
  async open() {
    await this.actions.stableNavigate(new URL('checkout', ENV.TOOLSHOP_URL).toString());
  }

  /** The cart row for a product. */
  cartRow(productName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  /** The quantity field in a product's cart row. */
  rowQuantity(productName: string): Locator {
    return this.page.getByRole('spinbutton', { name: `Quantity for ${productName}` });
  }

  /** Change a product's quantity in the cart and leave the field so the cart recalculates. */
  async setRowQuantity(productName: string, quantity: number) {
    await this.actions.safeFill(this.rowQuantity(productName), String(quantity));
    await this.actions.safePress(this.rowQuantity(productName), 'Tab');
  }

  /** Remove a product from the cart. */
  async removeItem(productName: string) {
    // The remove control is an <a class="btn-danger"> with only an icon: no role or label to target (MAP K10)
    await this.actions.safeClick(this.cartRow(productName).locator('.btn-danger'));
  }

  /** Continue to the next checkout step. */
  async proceed() {
    await this.actions.safeClick(this.proceedButton);
  }

  /** Sign in on the checkout's sign-in step. */
  async signIn(email: string, password: string) {
    await this.actions.safeFill(this.loginEmail, email);
    await this.actions.safeFill(this.loginPassword, password);
    await this.actions.safeClick(this.loginButton);
    await expect(this.alreadyLoggedIn).toBeVisible();
  }

  /** Continue as a guest with the given details. */
  async continueAsGuest(email: string, firstName: string, lastName: string) {
    await this.actions.safeClick(this.guestTab);
    await this.actions.safeFill(this.loginEmail, email);
    await this.actions.safeFill(this.guestFirstName, firstName);
    await this.actions.safeFill(this.guestLastName, lastName);
    await this.actions.safeClick(this.guestSubmit);
  }

  /** Fill postcode and house number; the shop's lookup then fills street, city and state (MAP "Address validation"). */
  async fillAddressByPostcode(postalCode: string, houseNumber: string, countryLabel?: string) {
    await expect(this.postalCode).toBeVisible();
    if (countryLabel) await this.actions.safeSelect(this.country, countryLabel);
    await this.actions.safeFill(this.postalCode, postalCode);
    await this.actions.safeFill(this.houseNumber, houseNumber);
    await expect(this.state).not.toHaveValue('');
  }

  /** Choose a payment method by its label. */
  async choosePaymentMethod(label: string) {
    await this.actions.safeSelect(this.paymentMethod, label);
  }

  /** Check the payment and wait for the success message. */
  async checkPayment() {
    await this.actions.safeClick(this.checkPaymentButton);
    await expect(this.paymentSuccess).toBeVisible();
  }

  /** Confirm the order. */
  async confirm() {
    await this.actions.safeClick(this.confirmButton);
  }
}
