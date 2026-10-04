import { Page, Locator, expect } from '@playwright/test';

export class Actions {
  constructor(private readonly page: Page) {}

  locator(target: Locator | string): Locator {
    return typeof target === 'string' ? this.page.locator(target) : target;
  }

  async safeClick(target: Locator | string, opts?: { timeout?: number }) {
    const loc = this.locator(target);
    await expect(loc).toBeVisible({ timeout: opts?.timeout ?? 10_000 });
    await expect(loc).toBeEnabled({ timeout: opts?.timeout ?? 10_000 });
    // click() scrolls into view itself and re-resolves the locator if the element re-renders;
    // a separate scrollIntoViewIfNeeded() fails with "not attached to the DOM" on SPAs like GitHub.
    await loc.click({ timeout: opts?.timeout ?? 10_000 });
  }

  async safeFill(target: Locator | string, value: string, opts?: { timeout?: number; clear?: boolean }) {
    const loc = this.locator(target);
    await expect(loc).toBeVisible({ timeout: opts?.timeout ?? 10_000 });
    if (opts?.clear ?? true) await loc.fill('');
    await loc.fill(value);
    await expect(loc).toHaveValue(value, { timeout: opts?.timeout ?? 10_000 });
  }

  /** Choose an option of a native <select> by its visible label and verify it took. */
  async safeSelect(target: Locator | string, label: string, opts?: { timeout?: number }) {
    const loc = this.locator(target);
    await expect(loc).toBeVisible({ timeout: opts?.timeout ?? 10_000 });
    await loc.selectOption({ label });
    await expect(loc.locator('option:checked')).toHaveText(label, { timeout: opts?.timeout ?? 10_000 });
  }

  async safeType(target: Locator | string, value: string, opts?: { delay?: number; timeout?: number }) {
    const loc = this.locator(target);
    await expect(loc).toBeVisible({ timeout: opts?.timeout ?? 10_000 });
    await loc.click();
    await loc.type(value, { delay: opts?.delay ?? 20 });
  }

  async safePress(target: Locator | string, key: string) {
    const loc = this.locator(target);
    await expect(loc).toBeVisible();
    await loc.press(key);
  }

  async stableNavigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
  }
}
