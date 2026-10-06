import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';
import { ToolshopHeader } from './ToolshopHeader';

// Locators from ui-context/toolshop/MAP.md (Account, flows A2, K15)
export class ToolshopAccountPage {
  readonly header: ToolshopHeader;
  readonly heading: Locator;
  readonly invoicesHeading: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.header = new ToolshopHeader(page, actions);
    this.heading = page.getByRole('heading', { name: 'My account', level: 1 });
    this.invoicesHeading = page.getByRole('heading', { name: 'Invoices', level: 1 });
  }

  /** A link in the account area, e.g. "Favorites" (the page has no main landmark; names may start with an icon space). */
  accountLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^\\s*${name}$`) });
  }

  /** Open "My account" directly. */
  async open() {
    await this.actions.stableNavigate(new URL('account', ENV.TOOLSHOP_URL).toString());
  }

  /** Open the invoices list. */
  async openInvoices() {
    await this.actions.stableNavigate(new URL('account/invoices', ENV.TOOLSHOP_URL).toString());
    await expect(this.invoicesHeading).toBeVisible();
  }

  /** The invoices-table cell for an invoice number. */
  invoiceCell(invoiceNumber: string): Locator {
    return this.page.getByRole('cell', { name: invoiceNumber, exact: true });
  }
}
