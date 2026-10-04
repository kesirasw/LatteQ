import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class UITestingPlaygroundPage {
  readonly dynamicIdButton: Locator;
  readonly delayedButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.dynamicIdButton = page.getByRole('button', { name: 'Button with Dynamic ID' });
    this.delayedButton = page.getByRole('button', { name: 'Button Appearing After Delay' });
  }

  /** Open the playground home page. */
  async open() {
    await this.actions.stableNavigate(ENV.UITP_URL);
    await expect(this.page.getByRole('heading', { name: 'UI Test Automation Playground' })).toBeVisible();
  }

  /** Navigate to the Dynamic ID scenario. */
  async openDynamicId() {
    await this.actions.safeClick(this.page.getByRole('link', { name: 'Dynamic ID' }));
    await expect(this.page.getByRole('heading', { name: 'Dynamic ID', exact: true })).toBeVisible();
  }

  /** Click the button whose id changes on every load. */
  async clickDynamicButton() {
    await this.actions.safeClick(this.dynamicIdButton);
  }

  /** Navigate to the Load Delay scenario (the page itself responds slowly). */
  async openLoadDelay() {
    await this.actions.safeClick(this.page.getByRole('link', { name: 'Load Delay' }));
    await expect(this.page.getByRole('heading', { name: 'Load Delays', exact: true })).toBeVisible();
  }

  /** Click the button that only renders after the delayed load. */
  async clickAppearingButton() {
    await this.actions.safeClick(this.delayedButton);
  }
}
