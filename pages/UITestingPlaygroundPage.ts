import { Page, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class UITestingPlaygroundPage {
  constructor(private readonly page: Page, private readonly actions: Actions) {}

  async open() {
    await this.actions.stableNavigate('https://uitestingplayground.com/');
    await expect(this.page.getByRole('heading', { name: 'UI Test Automation Playground' })).toBeVisible();
  }

  async openDynamicId() {
    await this.actions.safeClick(this.page.getByRole('link', { name: 'Dynamic ID' }));
    await expect(this.page.getByRole('heading', { name: 'Dynamic ID' })).toBeVisible();
  }

  async clickDynamicButton() {
    await this.actions.safeClick(this.page.getByRole('button', { name: 'Button with Dynamic ID' }));
  }

  async openLoadDelay() {
    await this.actions.safeClick(this.page.getByRole('link', { name: 'Load Delay' }));
    await expect(this.page.getByRole('heading', { name: 'Load Delay' })).toBeVisible();
  }

  async clickAppearingButton() {
    await this.actions.safeClick(this.page.getByRole('button', { name: 'Button Appearing After Delay' }));
  }
}
