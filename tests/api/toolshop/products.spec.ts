import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { PaginatedProducts, PaginatedProductsSchema } from '../../../fixtures/api/schemas/toolshop/productSchema';

// Plan: test-plans/toolshop/test-cases/07-backend-checks.md

test.describe('GET /products', () => {
  // TC-API-02
  test('TC-API-02 Toolshop API: listing products matches the catalogue @api', async ({
    apiRequest,
    toolshopCatalog,
  }) => {
    let apiNames: string[] = [];

    await test.step('List products via GET /products', async () => {
      const { status, body } = await apiRequest<PaginatedProducts>({
        method: 'GET',
        url: `${ToolshopApi.PRODUCTS}?page=1`,
        baseUrl: ENV.TOOLSHOP_API_URL,
      });

      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      apiNames = (body.data ?? []).map((p) => p.name ?? '');
      expect(apiNames.length).toBeGreaterThan(0);
    });

    await test.step('Compare with the first page of the website catalogue', async () => {
      await toolshopCatalog.open();
      expect(await toolshopCatalog.productNames()).toEqual(apiNames);
    });
  });
});
