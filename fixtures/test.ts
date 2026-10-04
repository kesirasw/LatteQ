import { test as base, mergeTests } from '@playwright/test';
import { test as apiRequestFixture } from './api/api-request-fixture';
import { Actions } from '../utils/actions';
import { Network } from '../utils/network';

import { BookingPage } from '../pages/BookingPage';
import { GitHubPage } from '../pages/GitHubPage';
import { DataTablesPage } from '../pages/DataTablesPage';
import { UITestingPlaygroundPage } from '../pages/UITestingPlaygroundPage';
import { MUIPage } from '../pages/MUIPage';
import { HighchartsPage } from '../pages/HighchartsPage';

type Fixtures = {
  actions: Actions;
  network: Network;
  booking: BookingPage;
  github: GitHubPage;
  datatables: DataTablesPage;
  uitp: UITestingPlaygroundPage;
  mui: MUIPage;
  highcharts: HighchartsPage;
};

const uiTest = base.extend<Fixtures>({
  actions: async ({ page }, use) => await use(new Actions(page)),
  network: async ({ page }, use) => await use(new Network(page)),

  booking: async ({ page, actions }, use) => await use(new BookingPage(page, actions)),
  github: async ({ page, actions }, use) => await use(new GitHubPage(page, actions)),
  datatables: async ({ page, actions }, use) => await use(new DataTablesPage(page, actions)),
  uitp: async ({ page, actions }, use) => await use(new UITestingPlaygroundPage(page, actions)),
  mui: async ({ page, actions }, use) => await use(new MUIPage(page, actions)),
  highcharts: async ({ page, actions }, use) => await use(new HighchartsPage(page, actions)),
});

/** The single `test` for every spec: page objects + utils + `apiRequest`. */
export const test = mergeTests(uiTest, apiRequestFixture);

export { expect } from '@playwright/test';
