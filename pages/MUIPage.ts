import { Page, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class MUIPage {
  constructor(private readonly page: Page, private readonly actions: Actions) {}

  async openSelectDemo() {
    await this.actions.stableNavigate('https://mui.com/material-ui/react-select/');
    await expect(this.page.getByRole('heading', { name: /select/i })).toBeVisible();
  }

  async pickSimpleSelect(optionText: string) {
    const combo = this.page.getByRole('combobox').first();
    await this.actions.safeClick(combo);
    await this.actions.safeClick(this.page.getByRole('option', { name: optionText }));
    await expect(combo).toContainText(optionText);
  }
}
