import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class HighchartsPage {
  readonly rejectCookies: Locator;
  readonly chartFrame: FrameLocator;
  readonly chart: Locator;
  readonly tooltip: Locator;

  constructor(
    private readonly page: Page,
    private readonly actions: Actions,
  ) {
    this.rejectCookies = page.getByRole('button', { name: 'Reject all' });
    // Each demo renders its chart inside an iframe titled "Highcharts <name> demo"
    this.chartFrame = page.getByTitle(/^Highcharts .* demo$/).contentFrame();
    this.chart = this.chartFrame.getByRole('region', { name: /Highcharts interactive chart/ });
    // SVG tooltip has no accessible role
    this.tooltip = this.chartFrame.locator('.highcharts-tooltip');
  }

  /** Open the demo index and dismiss the cookie banner that overlays it. */
  async openDemo() {
    await this.actions.stableNavigate(ENV.HIGHCHARTS_URL);
    await this.actions.safeClick(this.rejectCookies);
    await expect(this.rejectCookies).toBeHidden();
    await expect(this.page.getByRole('heading', { name: 'Highcharts Demos', exact: true })).toBeVisible();
  }

  /** Open a demo from the Overview section by its tile name and wait for the chart. */
  async openOverviewDemo(name: string) {
    await this.actions.safeClick(this.page.getByRole('region', { name: 'Overview' }).getByRole('link', { name }));
    await expect(this.chart).toBeVisible();
  }

  /**
   * Hover a data point by its accessible description. The date part is locale-formatted
   * ("Thursday 1 Jan, 03:00" vs "Thursday, Jan 1, 03:00 AM"), so pass a pattern for the stable parts.
   */
  async hoverPoint(pointName: RegExp) {
    const point = this.chartFrame.getByRole('img', { name: pointName });
    // Markers are opacity 0 and Highcharts tracks mouse *movement*: a single hover() event
    // doesn't open the tooltip, so move across the marker in two steps.
    await point.hover({ position: { x: 2, y: 2 } });
    await point.hover({ position: { x: 5, y: 5 } });
    await expect(this.tooltip).toBeVisible();
  }
}
