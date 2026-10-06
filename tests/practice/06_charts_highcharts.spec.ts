import { test, expect } from '../../fixtures/test';

test('Highcharts: hovering a line-chart point shows its value in the tooltip', async ({ highcharts }) => {
  await highcharts.openDemo();
  await highcharts.openOverviewDemo('Line chart');
  await highcharts.hoverPoint(/03:00.*, 1,048\. Users\.$/);

  await expect(highcharts.tooltip).toContainText('Users');
  await expect(highcharts.tooltip).toContainText('1,048');
});
