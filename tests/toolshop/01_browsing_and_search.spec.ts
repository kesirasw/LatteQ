import { test, expect } from '../../fixtures/test';
import { ToolshopData } from '../../data/toolshop-data';

// Plan: test-plans/toolshop/test-cases/01-browsing-and-search.md

const ascending = (values: number[]) => values.every((v, i) => i === 0 || values[i - 1] <= v);
const descending = (values: number[]) => values.every((v, i) => i === 0 || values[i - 1] >= v);
const alphabetical = (names: string[]) => names.every((n, i) => i === 0 || names[i - 1].localeCompare(n) <= 0);

test.describe('Toolshop: browsing and search', () => {
  test.beforeEach(async ({ toolshopCatalog }) => {
    await toolshopCatalog.open();
  });

  test('TC-CAT-01 Toolshop: home page shows a page of products @smoke', async ({ toolshopCatalog, page }) => {
    await expect(toolshopCatalog.productNameItems).toHaveCount(9);
    await expect(toolshopCatalog.productPriceItems).toHaveCount(9);
    for (const name of ['Page-1', 'Page-2', 'Page-3', 'Page-4', 'Page-5', 'Previous', 'Next']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('TC-CAT-02 Toolshop: searching shows only matching products @smoke', async ({ toolshopCatalog }) => {
    await toolshopCatalog.search(ToolshopData.searchTerm);

    await expect(toolshopCatalog.searchHeading).toHaveText(`Searched for: ${ToolshopData.searchTerm}`);
    await expect
      .poll(async () => {
        const names = await toolshopCatalog.productNames();
        return names.length > 0 && names.every((n) => /pliers/i.test(n));
      })
      .toBe(true);
  });

  test('TC-CAT-03 Toolshop: clearing the search brings back all products', async ({ toolshopCatalog }) => {
    await toolshopCatalog.search(ToolshopData.searchTerm);
    await toolshopCatalog.clearSearch();

    await expect(toolshopCatalog.productNameItems).toHaveCount(9);
    await expect.poll(async () => (await toolshopCatalog.productNames()).some((n) => !/pliers/i.test(n))).toBe(true);
  });

  test('TC-CAT-04 Toolshop: sorting by price, lowest first', async ({ toolshopCatalog }) => {
    await toolshopCatalog.sortBy(ToolshopData.sortOptions.priceAsc);

    await expect.poll(async () => ascending(await toolshopCatalog.productPrices())).toBe(true);
  });

  test('TC-CAT-05 Toolshop: other sort options order the list correctly', async ({ toolshopCatalog }) => {
    await test.step('Price (High - Low)', async () => {
      await toolshopCatalog.sortBy(ToolshopData.sortOptions.priceDesc);
      await expect.poll(async () => descending(await toolshopCatalog.productPrices())).toBe(true);
    });

    await test.step('Name (A - Z)', async () => {
      await toolshopCatalog.sortBy(ToolshopData.sortOptions.nameAsc);
      await expect.poll(async () => alphabetical(await toolshopCatalog.productNames())).toBe(true);
    });

    await test.step('Name (Z - A)', async () => {
      await toolshopCatalog.sortBy(ToolshopData.sortOptions.nameDesc);
      await expect.poll(async () => alphabetical((await toolshopCatalog.productNames()).reverse())).toBe(true);
    });
  });

  test('TC-CAT-06 Toolshop: filtering by a product category', async ({ toolshopCatalog }) => {
    await toolshopCatalog.filterByCategory(ToolshopData.category);

    await expect
      .poll(async () => {
        const names = await toolshopCatalog.productNames();
        return names.length > 0 && names.every((n) => /hammer/i.test(n));
      })
      .toBe(true);
  });

  test('TC-CAT-07 Toolshop: filtering by brand', async ({ toolshopCatalog, toolshopProduct, page }) => {
    const unfiltered = await toolshopCatalog.productNames();
    await toolshopCatalog.filterByBrand(ToolshopData.brand);
    await expect.poll(async () => (await toolshopCatalog.productNames()).join()).not.toBe(unfiltered.join());

    const [first] = await toolshopCatalog.productNames();
    await toolshopCatalog.openProduct(first);
    await expect(toolshopProduct.title).toHaveText(first);
    await expect(page.getByText(ToolshopData.brand)).toBeVisible();
  });

  test('TC-CAT-08 Toolshop: showing only eco-friendly products', async ({ toolshopCatalog }) => {
    await toolshopCatalog.showEcoFriendlyOnly();

    await expect
      .poll(async () => {
        const ratings = await toolshopCatalog.co2Ratings();
        return ratings.length > 0 && ratings.every((r) => r === 'A' || r === 'B');
      })
      .toBe(true);
  });

  test('TC-CAT-09 Toolshop: limiting the price range', async ({ toolshopCatalog }) => {
    const max = await toolshopCatalog.lowerMaxPrice(1);
    expect(max).toBeGreaterThan(0);

    await expect
      .poll(async () => {
        const prices = await toolshopCatalog.productPrices();
        return prices.length > 0 && prices.every((p) => p <= max);
      })
      .toBe(true);
  });

  test('TC-CAT-10 Toolshop: moving to the next page of products', async ({ toolshopCatalog }) => {
    const firstPage = await toolshopCatalog.productNames();
    await toolshopCatalog.goToPage(2);

    await expect
      .poll(async () => {
        const names = await toolshopCatalog.productNames();
        return names.length > 0 && names.every((n) => !firstPage.includes(n));
      })
      .toBe(true);
  });
});
