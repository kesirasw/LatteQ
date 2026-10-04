import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import type { ToolshopCustomerData } from '../data/toolshop-data';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Auth & account, flows A1–A5, R1–R4)
export class ToolshopAuthPage {
  readonly header: ToolshopHeader;
  readonly loginHeading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly accountHeading: Locator;
  readonly registerHeading: Locator;
  readonly registerButton: Locator;
  readonly forgotHeading: Locator;
  readonly setNewPasswordButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    this.loginHeading = page.getByRole('heading', { name: 'Login', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email address *' });
    this.password = page.getByRole('textbox', { name: 'Password *' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.accountHeading = page.getByRole('heading', { name: 'My account', level: 1 });
    this.registerHeading = page.getByRole('heading', { name: 'Customer registration' });
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.forgotHeading = page.getByRole('heading', { name: 'Forgot Password', level: 1 });
    this.setNewPasswordButton = page.getByRole('button', { name: 'Set New Password' });
  }

  private url(path: string): string {
    return new URL(path, ENV.TOOLSHOP_URL).toString();
  }

  /** Open the sign-in page. */
  async openLogin() {
    await this.actions.stableNavigate(this.url('auth/login'));
    await expect(this.loginHeading).toBeVisible();
  }

  /** Submit the sign-in form (fields left empty when not given). */
  async submitLogin(email: string, password: string) {
    if (email) await this.actions.safeFill(this.email, email);
    if (password) await this.actions.safeFill(this.password, password);
    await this.actions.safeClick(this.loginButton);
  }

  /** Sign in and wait for "My account". */
  async signIn(email: string, password: string) {
    await this.openLogin();
    await this.submitLogin(email, password);
    await expect(this.accountHeading).toBeVisible();
  }

  /** Open the registration page. */
  async openRegister() {
    await this.actions.stableNavigate(this.url('auth/register'));
    await expect(this.registerButton).toBeVisible();
  }

  /** Fill the registration form; the postcode lookup fills street, city and state. */
  async fillRegistration(customer: ToolshopCustomerData, countryLabel: string) {
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'First name' }), customer.first_name);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Last name' }), customer.last_name);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Date of Birth *' }), customer.dob);
    await this.actions.safeSelect(this.page.getByRole('combobox', { name: 'Country' }), countryLabel);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Postal code' }), customer.address.postal_code);
    await this.actions.safeFill(
      this.page.getByRole('textbox', { name: 'House number' }),
      customer.address.house_number,
    );
    await expect(this.page.getByRole('textbox', { name: 'State' })).not.toHaveValue('');
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Phone' }), customer.phone);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Email address' }), customer.email);
    await this.actions.safeFill(this.page.getByRole('textbox', { name: 'Password' }), customer.password);
  }

  /** Submit the registration form. */
  async submitRegistration() {
    await this.actions.safeClick(this.registerButton);
  }

  /** Open "Forgot Password" and request a new password for an email address. */
  async requestNewPassword(email: string) {
    await this.actions.stableNavigate(this.url('auth/forgot-password'));
    await expect(this.forgotHeading).toBeVisible();
    await this.actions.safeFill(this.email, email);
    await this.actions.safeClick(this.setNewPasswordButton);
  }
}
