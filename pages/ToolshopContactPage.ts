import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Contact, flows F1–F2)
export class ToolshopContactPage {
  readonly header: ToolshopHeader;
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly attachment: Locator;
  readonly sendButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    this.heading = page.getByRole('heading', { name: 'Contact', level: 3 });
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.email = page.getByRole('textbox', { name: 'Email address' });
    this.subject = page.getByRole('combobox', { name: 'Subject' });
    this.message = page.getByRole('textbox', { name: 'Message *' });
    // The file input is exposed as a button named "Attachment"
    this.attachment = page.getByRole('button', { name: 'Attachment' });
    this.sendButton = page.getByRole('button', { name: 'Send' });
  }

  /** A message shown on the form, e.g. "Email is required". */
  notice(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  /** Open the contact page. */
  async open() {
    await this.actions.stableNavigate(new URL('contact', ENV.TOOLSHOP_URL).toString());
    await expect(this.heading).toBeVisible();
  }

  /** Fill every field of the form. */
  async fill(details: { firstName: string; lastName: string; email: string; subject: string; message: string }) {
    await this.actions.safeFill(this.firstName, details.firstName);
    await this.actions.safeFill(this.lastName, details.lastName);
    await this.actions.safeFill(this.email, details.email);
    await this.actions.safeSelect(this.subject, details.subject);
    await this.actions.safeFill(this.message, details.message);
  }

  /** Attach a file. */
  async attach(filePath: string) {
    await this.attachment.setInputFiles(filePath);
  }

  /** Send the form. */
  async send() {
    await this.actions.safeClick(this.sendButton);
  }
}
