import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class MUIPage {
  readonly basicSelect: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    // Four demos share the 'Age' label; the Basic select demo is the first on the page
    this.basicSelect = page.getByRole('combobox', { name: 'Age' }).first();
  }

  /** Open the Select docs page. */
  async openSelectDemo() {
    await this.actions.stableNavigate(ENV.MUI_URL);
    await expect(this.page.getByRole('heading', { name: 'Select', exact: true })).toBeVisible();
  }

  /** Pick an option in the Basic select demo; options render in a portal at body level. */
  async pickSimpleSelect(optionText: string) {
    await this.actions.safeClick(this.basicSelect);
    await this.actions.safeClick(
      this.page.getByRole('listbox', { name: 'Age' }).getByRole('option', { name: optionText }),
    );
  }
}
