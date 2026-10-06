import { test as base, mergeTests } from '@playwright/test';
import { test as apiRequestFixture } from './api/api-request-fixture';
import { test as toolshopFixture } from './api/toolshop-fixture';
import { test as toolshopProductFixture } from './api/toolshop-product-fixture';
import { Actions } from '../utils/actions';
import { Network } from '../utils/network';

import { BookingPage } from '../pages/BookingPage';
import { GitHubPage } from '../pages/GitHubPage';
import { DataTablesPage } from '../pages/DataTablesPage';
import { UITestingPlaygroundPage } from '../pages/UITestingPlaygroundPage';
import { MUIPage } from '../pages/MUIPage';
import { HighchartsPage } from '../pages/HighchartsPage';
import { ToolshopCatalogPage } from '../pages/ToolshopCatalogPage';
import { ToolshopProductPage } from '../pages/ToolshopProductPage';
import { ToolshopCheckoutPage } from '../pages/ToolshopCheckoutPage';
import { ToolshopAuthPage } from '../pages/ToolshopAuthPage';
import { ToolshopAccountPage } from '../pages/ToolshopAccountPage';
import { ToolshopContactPage } from '../pages/ToolshopContactPage';

type Fixtures = {
  actions: Actions;
  network: Network;
  booking: BookingPage;
  github: GitHubPage;
  datatables: DataTablesPage;
  uitp: UITestingPlaygroundPage;
  mui: MUIPage;
  highcharts: HighchartsPage;
  toolshopCatalog: ToolshopCatalogPage;
  toolshopProduct: ToolshopProductPage;
  toolshopCheckout: ToolshopCheckoutPage;
  toolshopAuth: ToolshopAuthPage;
  toolshopAccount: ToolshopAccountPage;
  toolshopContact: ToolshopContactPage;
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

  toolshopCatalog: async ({ page, actions }, use) => await use(new ToolshopCatalogPage(page, actions)),
  toolshopProduct: async ({ page, actions }, use) => await use(new ToolshopProductPage(page, actions)),
  toolshopCheckout: async ({ page, actions }, use) => await use(new ToolshopCheckoutPage(page, actions)),
  toolshopAuth: async ({ page, actions }, use) => await use(new ToolshopAuthPage(page, actions)),
  toolshopAccount: async ({ page, actions }, use) => await use(new ToolshopAccountPage(page, actions)),
  toolshopContact: async ({ page, actions }, use) => await use(new ToolshopContactPage(page, actions)),
});

/** The single `test` for every spec: page objects + utils + `apiRequest` + Toolshop helpers. */
export const test = mergeTests(uiTest, apiRequestFixture, toolshopFixture, toolshopProductFixture);

export { expect } from '@playwright/test';
