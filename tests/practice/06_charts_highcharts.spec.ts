import { test } from '../../fixtures/test';

test('Highcharts: open demo + hover tooltip', async ({ highcharts }) => {
  await highcharts.openDemo();
  await highcharts.openFirstDemoTile();
  await highcharts.hoverFirstPointAndAssertTooltip();
});
