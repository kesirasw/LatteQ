import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';

export class HighchartsPage {
  readonly chart: Locator;

  constructor(private readonly page: Page, private readonly actions: Actions) {
    this.chart = page.locator('.highcharts-container').first();
  }

  async openDemo() {
    await this.actions.stableNavigate('https://www.highcharts.com/demo');
    await expect(this.page.getByRole('heading', { name: /highcharts demos/i })).toBeVisible();
  }

  async openFirstDemoTile() {
    const firstDemo = this.page.locator('a.demo-card, a[href*="/demo/"]').first();
    await this.actions.safeClick(firstDemo);
    await expect(this.chart).toBeVisible();
  }

  async hoverFirstPointAndAssertTooltip() {
    const point = this.page.locator('.highcharts-point').first();
    await expect(point).toBeVisible();
    await point.hover();
    const tooltip = this.page.locator('.highcharts-tooltip').first();
    await expect(tooltip).toBeVisible();
  }

  async toggleFirstLegendItem() {
    const legendItem = this.page.locator('.highcharts-legend-item').first();
    await expect(legendItem).toBeVisible();
    await legendItem.click();
  }
}
