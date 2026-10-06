import { test as base } from '@playwright/test';
import { apiRequest } from './plain-function';
import { ENV } from '../../data/env';
import { ToolshopApi } from '../../data/api-endpoints';
import { ToolshopData } from '../../data/toolshop-data';
import { PaginatedProductsSchema } from './schemas/toolshop/productSchema';

export type ToolshopStockProduct = { id: string; name: string };

type ToolshopProductFixtures = {
  /**
   * A product from the catalogue's first page that can be bought right now: Combination Pliers when it's
   * in stock, otherwise the first in-stock product. The demo is shared, so other people's orders sell
   * products out and "Add to cart" turns disabled (KB §16). Use it wherever a test adds to the cart or
   * changes the quantity; tests that only view a product can keep a fixed one.
   */
  toolshopInStockProduct: ToolshopStockProduct;
};

export const test = base.extend<ToolshopProductFixtures>({
  toolshopInStockProduct: async ({ request }, use) => {
    const { status, body } = await apiRequest({
      request,
      method: 'GET',
      url: ToolshopApi.PRODUCTS,
      baseUrl: ENV.TOOLSHOP_API_URL,
    });
    if (status !== 200) throw new Error(`Listing Toolshop products failed: ${status}`);

    const inStock = (PaginatedProductsSchema.parse(body).data ?? []).flatMap((p) =>
      p.in_stock && p.id && p.name ? [{ id: p.id, name: p.name }] : [],
    );
    const product = inStock.find((p) => p.name === ToolshopData.products.combinationPliers) ?? inStock[0];
    if (!product) throw new Error('No in-stock product on the first catalogue page of the Toolshop demo');
    await use(product);
  },
});
