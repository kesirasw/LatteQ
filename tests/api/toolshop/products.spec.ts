/* eslint-disable playwright/no-skipped-test -- FIXME-parked tests (api-testing skill, Phase 7) */
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { ToolshopData } from '../../../data/toolshop-data';
import { ToolshopInvalidData } from '../../../data/toolshop-invalid-data';
import {
  PaginatedProducts,
  PaginatedProductsSchema,
  Product,
  ProductSchema,
  RelatedProducts,
  RelatedProductsSchema,
} from '../../../fixtures/api/schemas/toolshop/productSchema';
import {
  ForbiddenResponse,
  ForbiddenResponseSchema,
  MethodNotAllowedResponse,
  MethodNotAllowedResponseSchema,
  NotFoundResponse,
  NotFoundResponseSchema,
  UnauthenticatedResponse,
  UnauthenticatedResponseSchema,
  ValidationErrorResponse,
  ValidationErrorResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';
import type { ApiRequestFn } from '../../../fixtures/api/api-types';

// Plan: test-plans/toolshop/test-cases/07-backend-checks.md (TC-API-02)
//       test-plans/toolshop/api/test-cases/02-products.md (API-PRD-*)

const api = ENV.TOOLSHOP_API_URL;

const listProducts = (apiRequest: ApiRequestFn, query = '') =>
  apiRequest<PaginatedProducts>({ method: 'GET', url: `${ToolshopApi.PRODUCTS}${query}`, baseUrl: api });

/** The first product of the catalogue (IDs change on every demo reset, so never hard-code them). */
async function firstProduct(apiRequest: ApiRequestFn): Promise<Product> {
  const { status, body } = await listProducts(apiRequest);
  expect(status).toBe(200);
  expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
  return body.data?.[0] ?? {};
}

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

  // API-PRD-01
  test('API-PRD-01 Toolshop API: the first page has nine complete products and paging details @api', async ({
    apiRequest,
  }) => {
    const { status, body } = await listProducts(apiRequest);

    expect(status).toBe(200);
    expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
    expect(body).toMatchObject({ current_page: 1, per_page: 9 });
    expect(body.total).toBeGreaterThan(9);
    expect(body.data).toHaveLength(9);
    for (const product of body.data ?? []) {
      expect(product).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        brand: expect.any(Object),
        category: expect.any(Object),
        product_image: expect.any(Object),
      });
    }
  });

  // API-PRD-02
  test('API-PRD-02 Toolshop API: page 2 differs from page 1 and a page past the end is empty @api', async ({
    apiRequest,
  }) => {
    let firstPageIds: string[] = [];
    let total = 0;

    await test.step('List page 1 via GET /products', async () => {
      const { status, body } = await listProducts(apiRequest, '?page=1');
      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      firstPageIds = (body.data ?? []).map((p) => p.id ?? '');
      total = body.total ?? 0;
    });

    await test.step('List page 2 via GET /products', async () => {
      const { status, body } = await listProducts(apiRequest, '?page=2');
      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      expect(body.current_page).toBe(2);
      const secondPageIds = (body.data ?? []).map((p) => p.id ?? '');
      expect(secondPageIds.length).toBeGreaterThan(0);
      expect(secondPageIds.filter((id) => firstPageIds.includes(id))).toEqual([]);
    });

    await test.step('List page 999 via GET /products', async () => {
      const { status, body } = await listProducts(apiRequest, '?page=999');
      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      expect(body.data).toEqual([]);
      expect(body.total).toBe(total);
      expect(body.last_page).toBe(Math.ceil(total / (body.per_page ?? 9)));
    });
  });

  // API-PRD-03
  for (const page of ['0', '-1', 'abc']) {
    test(`API-PRD-03 Toolshop API: page "${page}" shows the first page @api`, async ({ apiRequest }) => {
      const { status, body } = await listProducts(apiRequest, `?page=${page}`);

      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      expect(body.current_page).toBe(1);
    });
  }

  // API-PRD-04, API-PRD-05
  for (const [caseId, filter] of [
    ['API-PRD-04', 'category'],
    ['API-PRD-05', 'brand'],
  ] as const) {
    test(`${caseId} Toolshop API: filtering by ${filter} returns only that ${filter} @api`, async ({ apiRequest }) => {
      const product = await firstProduct(apiRequest);
      const filterId = product[filter]?.id ?? '';

      const { status, body } = await listProducts(apiRequest, `?by_${filter}=${filterId}`);

      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      expect(body.data?.length).toBeGreaterThan(0);
      expect(new Set(body.data?.map((p) => p[filter]?.id))).toEqual(new Set([filterId]));
    });
  }

  // API-PRD-06
  test('API-PRD-06 Toolshop API: a price range returns only prices in that range @api', async ({ apiRequest }) => {
    const { status, body } = await listProducts(apiRequest, '?between=price,10,30');

    expect(status).toBe(200);
    expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
    const prices = (body.data ?? []).map((p) => p.price ?? -1);
    expect(prices.length).toBeGreaterThan(0);
    expect(prices.filter((price) => price < 10 || price > 30)).toEqual([]);
  });

  // API-PRD-07
  test('API-PRD-07 Toolshop API: the rental filter returns only rentals @api', async ({ apiRequest }) => {
    const { status, body } = await listProducts(apiRequest, '?is_rental=true');

    expect(status).toBe(200);
    expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
    expect(body.data?.length).toBeGreaterThan(0);
    expect(new Set(body.data?.map((p) => p.is_rental))).toEqual(new Set([true]));
  });

  // API-PRD-08
  for (const { sort, key, direction } of [
    { sort: 'price,asc', key: 'price', direction: 1 },
    { sort: 'price,desc', key: 'price', direction: -1 },
    { sort: 'name,asc', key: 'name', direction: 1 },
    { sort: 'name,desc', key: 'name', direction: -1 },
  ] as const) {
    test(`API-PRD-08 Toolshop API: sorting by ${sort} orders the page @api`, async ({ apiRequest }) => {
      const { status, body } = await listProducts(apiRequest, `?sort=${sort}`);

      expect(status).toBe(200);
      expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
      const values = (body.data ?? []).map((p) => p[key] ?? '');
      const sorted = [...values].sort((a, b) =>
        typeof a === 'number' && typeof b === 'number'
          ? (a - b) * direction
          : String(a).localeCompare(String(b)) * direction,
      );
      expect(values.length).toBeGreaterThan(1);
      expect(values).toEqual(sorted);
    });
  }

  // API-PRD-09
  // FIXME: an unknown sort value answers 500 "Something went wrong" (API test plan, finding 7; seen 2026-10-06)
  test.skip('API-PRD-09 Toolshop API: an unknown sort value is ignored or refused, never a server error @api', async ({
    apiRequest,
  }) => {
    const { status, body } = await listProducts(apiRequest, '?sort=nonsense');

    // Needs confirming: either ignored (200, default order) or refused (422)
    expect([200, 422]).toContain(status);
    expect(PaginatedProductsSchema.or(ValidationErrorResponseSchema).parse(body)).toBeTruthy();
  });
});

test.describe('GET /products/{productId}', () => {
  // API-PRD-10
  test('API-PRD-10 Toolshop API: one product matches its list entry @api', async ({ apiRequest }) => {
    const listed = await firstProduct(apiRequest);

    const { status, body } = await apiRequest<Product>({
      method: 'GET',
      url: `${ToolshopApi.PRODUCTS}/${listed.id}`,
      baseUrl: api,
    });

    expect(status).toBe(200);
    expect(ProductSchema.parse(body)).toBeTruthy();
    expect(body).toMatchObject({ id: listed.id, name: listed.name, price: listed.price });
  });

  // API-PRD-11
  test("API-PRD-11 Toolshop API: a product that doesn't exist is not found @api", async ({ apiRequest }) => {
    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'GET',
      url: `${ToolshopApi.PRODUCTS}/${ToolshopInvalidData.unknownId}`,
      baseUrl: api,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    expect(body.message).toMatch(/not found/i);
  });

  // API-PRD-12
  for (const { description, value } of ToolshopInvalidData.malformedIds) {
    test(`API-PRD-12 Toolshop API: a product ID that is ${description} is not found @api`, async ({ apiRequest }) => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'GET',
        url: `${ToolshopApi.PRODUCTS}/${encodeURIComponent(value)}`,
        baseUrl: api,
      });

      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    });
  }
});

test.describe('GET /products/{productId}/related', () => {
  // API-PRD-13
  test('API-PRD-13 Toolshop API: related products are other products from the same category @api', async ({
    apiRequest,
  }) => {
    const product = await firstProduct(apiRequest);

    const { status, body } = await apiRequest<RelatedProducts>({
      method: 'GET',
      url: ToolshopApi.relatedProducts(product.id ?? ''),
      baseUrl: api,
    });

    expect(status).toBe(200);
    expect(RelatedProductsSchema.parse(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    expect(body.map((p) => p.id)).not.toContain(product.id);
    expect(new Set(body.map((p) => p.category?.name))).toEqual(new Set([product.category?.name]));
  });

  // API-PRD-14
  // FIXME: related products of an unknown product answer 500 "Server Error" instead of the documented 404
  // (API test plan, finding 7; seen 2026-10-06)
  test.skip("API-PRD-14 Toolshop API: related products of a product that doesn't exist are not found @api", async ({
    apiRequest,
  }) => {
    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'GET',
      url: ToolshopApi.relatedProducts(ToolshopInvalidData.unknownId),
      baseUrl: api,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('GET /products/search', () => {
  // API-PRD-15
  test('API-PRD-15 Toolshop API: searching returns only matching names @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<PaginatedProducts>({
      method: 'GET',
      url: `${ToolshopApi.PRODUCT_SEARCH}?q=${ToolshopData.searchTerm}`,
      baseUrl: api,
    });

    expect(status).toBe(200);
    expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
    const names = (body.data ?? []).map((p) => p.name ?? '');
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.toLowerCase().includes(ToolshopData.searchTerm))).toEqual([]);
  });

  // API-PRD-16
  test('API-PRD-16 Toolshop API: a search with no matches returns an empty page @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<PaginatedProducts>({
      method: 'GET',
      url: `${ToolshopApi.PRODUCT_SEARCH}?q=zzzlatteqnothing`,
      baseUrl: api,
    });

    expect(status).toBe(200);
    expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
    expect(body).toMatchObject({ data: [], total: 0 });
  });

  // API-PRD-17
  // FIXME: a search without a phrase answers 200 with an empty page; the contract makes q required
  // (API test plan, finding 16; seen 2026-10-06)
  test.skip('API-PRD-17 Toolshop API: searching without a search phrase is refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'GET',
      url: ToolshopApi.PRODUCT_SEARCH,
      baseUrl: api,
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('Changing the catalogue without permission', () => {
  // API-PRD-18
  test('API-PRD-18 Toolshop API: deleting a product without a valid access key is refused @api', async ({
    apiRequest,
  }) => {
    const product = await firstProduct(apiRequest);

    for (const [description, token] of [
      ['no access key', undefined],
      ['an invalid access key', ToolshopInvalidData.invalidToken],
    ] as const) {
      await test.step(`Delete the product with ${description} via DELETE /products/{productId}`, async () => {
        const { status, body } = await apiRequest<UnauthenticatedResponse>({
          method: 'DELETE',
          url: `${ToolshopApi.PRODUCTS}/${product.id}`,
          baseUrl: api,
          headers: token,
        });

        expect(status).toBe(401);
        expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
      });
    }

    await test.step('Read the product via GET /products/{productId}', async () => {
      const { status, body } = await apiRequest<Product>({
        method: 'GET',
        url: `${ToolshopApi.PRODUCTS}/${product.id}`,
        baseUrl: api,
      });
      expect(status).toBe(200);
      expect(ProductSchema.parse(body)).toBeTruthy();
    });
  });

  // API-PRD-19 — 403 isn't documented for this operation (finding 12)
  test("API-PRD-19 Toolshop API: a customer can't delete a product @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const product = await firstProduct(apiRequest);

    await test.step('Delete the product as a customer via DELETE /products/{productId}', async () => {
      const { status, body } = await apiRequest<ForbiddenResponse>({
        method: 'DELETE',
        url: `${ToolshopApi.PRODUCTS}/${product.id}`,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(403);
      expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('Read the product via GET /products/{productId}', async () => {
      const { status, body } = await apiRequest<Product>({
        method: 'GET',
        url: `${ToolshopApi.PRODUCTS}/${product.id}`,
        baseUrl: api,
      });
      expect(status).toBe(200);
      expect(ProductSchema.parse(body)).toBeTruthy();
    });
  });

  // API-PRD-20
  // FIXME: POST /products has no sign-in check; anonymous requests go straight to validation (422)
  // (API test plan, finding 2; seen 2026-10-06). Sends no details, so nothing can be created.
  test.skip('API-PRD-20 Toolshop API: creating a product without an access key is refused @api', async ({
    apiRequest,
  }) => {
    const { status, body } = await apiRequest<UnauthenticatedResponse>({
      method: 'POST',
      url: ToolshopApi.PRODUCTS,
      baseUrl: api,
      body: {},
    });

    expect(status).toBe(401);
    expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
  });

  // API-PRD-21
  // FIXME: an anonymous PUT /products/{productId} answers 200 "success"; anybody can change the catalogue
  // (API test plan, finding 2; seen 2026-10-06). Sends no changes, so nothing changes even unprotected.
  test.skip('API-PRD-21 Toolshop API: changing a product without an access key is refused @api', async ({
    apiRequest,
  }) => {
    const product = await firstProduct(apiRequest);

    for (const method of ['PUT', 'PATCH'] as const) {
      await test.step(`Change the product via ${method} /products/{productId}`, async () => {
        const { status, body } = await apiRequest<UnauthenticatedResponse>({
          method,
          url: `${ToolshopApi.PRODUCTS}/${product.id}`,
          baseUrl: api,
          body: {},
        });

        expect(status).toBe(401);
        expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });
});

test.describe('Unsupported methods on product addresses', () => {
  // API-PRD-22
  test('API-PRD-22 Toolshop API: unsupported methods on product addresses are refused @api', async ({ apiRequest }) => {
    const product = await firstProduct(apiRequest);

    for (const [method, url] of [
      ['PATCH', ToolshopApi.PRODUCTS],
      ['POST', `${ToolshopApi.PRODUCTS}/${product.id}`],
    ] as const) {
      await test.step(`${method} ${url}`, async () => {
        const { status, body } = await apiRequest<MethodNotAllowedResponse>({ method, url, baseUrl: api });

        expect(status).toBe(405);
        expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });
});
