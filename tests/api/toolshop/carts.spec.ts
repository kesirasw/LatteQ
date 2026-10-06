/* eslint-disable playwright/no-skipped-test -- FIXME-parked tests (api-testing skill, Phase 7) */
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { ToolshopInvalidData } from '../../../data/toolshop-invalid-data';
import {
  Cart,
  CartCreated,
  CartCreatedSchema,
  CartItemAdded,
  CartItemAddedSchema,
  CartSchema,
} from '../../../fixtures/api/schemas/toolshop/orderSchema';
import { PaginatedProducts, PaginatedProductsSchema } from '../../../fixtures/api/schemas/toolshop/productSchema';
import {
  MethodNotAllowedResponse,
  MethodNotAllowedResponseSchema,
  NotFoundResponse,
  NotFoundResponseSchema,
  ValidationErrorResponse,
  ValidationErrorResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';
import type { ApiRequestFn } from '../../../fixtures/api/api-types';

// Plan: test-plans/toolshop/api/test-cases/03-carts.md

const api = ENV.TOOLSHOP_API_URL;

const readCart = (apiRequest: ApiRequestFn, cartId: string) =>
  apiRequest<Cart>({ method: 'GET', url: `${ToolshopApi.CARTS}/${cartId}`, baseUrl: api });

/** The nth product of the catalogue's first page (IDs change on every demo reset, so never hard-code them). */
async function catalogueProductId(apiRequest: ApiRequestFn, index: number): Promise<string> {
  const { status, body } = await apiRequest<PaginatedProducts>({
    method: 'GET',
    url: ToolshopApi.PRODUCTS,
    baseUrl: api,
  });
  expect(status).toBe(200);
  expect(PaginatedProductsSchema.parse(body)).toBeTruthy();
  return body.data?.[index]?.id ?? '';
}

test.describe('POST /carts', () => {
  // API-CRT-01, API-CRT-02
  test('API-CRT-01 Toolshop API: a new cart is created empty @api', async ({ apiRequest }) => {
    let cartId = '';

    await test.step('Create a cart via POST /carts', async () => {
      const { status, body } = await apiRequest<CartCreated>({ method: 'POST', url: ToolshopApi.CARTS, baseUrl: api });

      expect(status).toBe(201);
      expect(CartCreatedSchema.parse(body)).toBeTruthy();
      cartId = body.id;
    });

    // API-CRT-02
    await test.step('Read the new cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cartId);

      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.id).toBe(cartId);
      expect(body.cart_items).toEqual([]);
    });

    await test.step('Delete the cart via DELETE /carts/{cartId}', async () => {
      const { status } = await apiRequest({ method: 'DELETE', url: `${ToolshopApi.CARTS}/${cartId}`, baseUrl: api });
      expect(status).toBe(204);
    });
  });
});

test.describe('POST /carts/{id}', () => {
  // API-CRT-03, API-CRT-04
  test('API-CRT-03 Toolshop API: adding a product, then the same product again, adds up the quantity @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ lines: 0 });
    const productId = await catalogueProductId(apiRequest, 0);

    for (const quantity of [2, 1]) {
      await test.step(`Add ${quantity} of the product via POST /carts/{id}`, async () => {
        const { status, body } = await apiRequest<CartItemAdded>({
          method: 'POST',
          url: `${ToolshopApi.CARTS}/${cart.id}`,
          baseUrl: api,
          body: { product_id: productId, quantity },
        });

        expect(status).toBe(200);
        expect(CartItemAddedSchema.parse(body)).toBeTruthy();
        expect(body.result).toMatch(/added or updated/);
      });
    }

    await test.step('Read the cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);

      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items).toHaveLength(1);
      expect(body.cart_items?.[0]).toMatchObject({ product_id: productId, quantity: 3 });
      expect(body.cart_items?.[0].product.name).toBeTruthy();
    });
  });

  // API-CRT-05
  test('API-CRT-05 Toolshop API: adding with an empty request names both details @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ lines: 0 });

    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: `${ToolshopApi.CARTS}/${cart.id}`,
      baseUrl: api,
      body: {},
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors).sort()).toEqual(['product_id', 'quantity']);
  });

  // API-CRT-06, API-CRT-07, API-CRT-08, API-CRT-09
  test('API-CRT-06 Toolshop API: adding with a missing, wrong or impossible detail is refused @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ lines: 0 });
    const productId = await catalogueProductId(apiRequest, 0);

    for (const { caseId, description, body: requestBody, field } of [
      { caseId: 'API-CRT-06', description: 'no product', body: { quantity: 1 }, field: 'product_id' },
      { caseId: 'API-CRT-06', description: 'no quantity', body: { product_id: productId }, field: 'quantity' },
      {
        caseId: 'API-CRT-07',
        description: 'a product that is a number',
        body: { product_id: 123, quantity: 1 },
        field: 'product_id',
      },
      {
        caseId: 'API-CRT-07',
        description: 'a product that is a yes/no value',
        body: { product_id: true, quantity: 1 },
        field: 'product_id',
      },
      {
        caseId: 'API-CRT-07',
        description: 'a quantity that is text',
        body: { product_id: productId, quantity: 'two' },
        field: 'quantity',
      },
      {
        caseId: 'API-CRT-07',
        description: 'an empty quantity',
        body: { product_id: productId, quantity: null },
        field: 'quantity',
      },
      {
        caseId: 'API-CRT-08',
        description: 'quantity 0',
        body: { product_id: productId, quantity: 0 },
        field: 'quantity',
      },
      {
        caseId: 'API-CRT-08',
        description: 'quantity -1',
        body: { product_id: productId, quantity: -1 },
        field: 'quantity',
      },
      {
        caseId: 'API-CRT-09',
        description: "a product that doesn't exist",
        body: { product_id: ToolshopInvalidData.unknownId, quantity: 1 },
        field: 'product_id',
      },
    ]) {
      await test.step(`${caseId}: add ${description} via POST /carts/{id}`, async () => {
        const { status, body } = await apiRequest<ValidationErrorResponse>({
          method: 'POST',
          url: `${ToolshopApi.CARTS}/${cart.id}`,
          baseUrl: api,
          body: requestBody,
        });

        expect(status).toBe(422);
        expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body.errors)).toEqual([field]);
      });
    }

    await test.step('Read the still-empty cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items).toEqual([]);
    });
  });

  // API-CRT-10
  test("API-CRT-10 Toolshop API: adding to a cart that doesn't exist is not found @api", async ({ apiRequest }) => {
    const productId = await catalogueProductId(apiRequest, 0);

    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'POST',
      url: `${ToolshopApi.CARTS}/${ToolshopInvalidData.unknownId}`,
      baseUrl: api,
      body: { product_id: productId, quantity: 1 },
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    expect(body.message).toMatch(/cart not found/i);
  });
});

test.describe('GET /carts/{cartId}', () => {
  // API-CRT-11
  test("API-CRT-11 Toolshop API: a cart that doesn't exist is not found @api", async ({ apiRequest }) => {
    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'GET',
      url: `${ToolshopApi.CARTS}/${ToolshopInvalidData.unknownId}`,
      baseUrl: api,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });

  // API-CRT-12
  for (const { description, value } of ToolshopInvalidData.malformedIds) {
    test(`API-CRT-12 Toolshop API: a cart ID that is ${description} is not found @api`, async ({ apiRequest }) => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'GET',
        url: `${ToolshopApi.CARTS}/${encodeURIComponent(value)}`,
        baseUrl: api,
      });

      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    });
  }
});

test.describe('PUT /carts/{cartId}/product/quantity', () => {
  // API-CRT-13
  test("API-CRT-13 Toolshop API: changing a product's quantity replaces it @api", async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ quantity: 2 });
    const { productId } = cart.lines[0];

    await test.step('Change the quantity to 5 via PUT /carts/{cartId}/product/quantity', async () => {
      const { status, body } = await apiRequest<CartItemAdded>({
        method: 'PUT',
        url: ToolshopApi.cartQuantity(cart.id),
        baseUrl: api,
        body: { product_id: productId, quantity: 5 },
      });

      expect(status).toBe(200);
      expect(CartItemAddedSchema.parse(body)).toBeTruthy();
    });

    await test.step('Read the cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items?.map((item) => [item.product_id, item.quantity])).toEqual([[productId, 5]]);
    });
  });

  // API-CRT-14
  test('API-CRT-14 Toolshop API: changing a quantity to something invalid is refused and changes nothing @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ quantity: 2 });
    const { productId } = cart.lines[0];

    for (const { description, body: requestBody, fields } of [
      { description: 'nothing at all', body: {}, fields: ['product_id', 'quantity'] },
      { description: 'the product, no quantity', body: { product_id: productId }, fields: ['quantity'] },
      {
        description: 'a quantity that is text',
        body: { product_id: productId, quantity: 'two' },
        fields: ['quantity'],
      },
      { description: 'quantity 0', body: { product_id: productId, quantity: 0 }, fields: ['quantity'] },
    ]) {
      await test.step(`Send ${description} via PUT /carts/{cartId}/product/quantity`, async () => {
        const { status, body } = await apiRequest<ValidationErrorResponse>({
          method: 'PUT',
          url: ToolshopApi.cartQuantity(cart.id),
          baseUrl: api,
          body: requestBody,
        });

        expect(status).toBe(422);
        expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body.errors).sort()).toEqual(fields);
      });
    }

    await test.step('Read the unchanged cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items?.map((item) => item.quantity)).toEqual([2]);
    });
  });

  // API-CRT-15
  // FIXME: changing the quantity of a product that isn't in the cart answers 200 and adds it; the contract documents
  // 404 (API test plan, question 21 — may be intended; seen 2026-10-06)
  test.skip("API-CRT-15 Toolshop API: changing the quantity of a product that isn't in the cart is not found @api", async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart();
    const otherProductId = await catalogueProductId(apiRequest, 1);

    await test.step('Change the quantity of another product via PUT /carts/{cartId}/product/quantity', async () => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'PUT',
        url: ToolshopApi.cartQuantity(cart.id),
        baseUrl: api,
        body: { product_id: otherProductId, quantity: 5 },
      });

      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('Read the cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items?.map((item) => item.product_id)).toEqual([cart.lines[0].productId]);
    });
  });

  // API-CRT-16
  test("API-CRT-16 Toolshop API: changing a quantity in a cart that doesn't exist is not found @api", async ({
    apiRequest,
  }) => {
    const productId = await catalogueProductId(apiRequest, 0);

    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'PUT',
      url: ToolshopApi.cartQuantity(ToolshopInvalidData.unknownId),
      baseUrl: api,
      body: { product_id: productId, quantity: 5 },
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('DELETE /carts/{cartId}/product/{productId}', () => {
  // API-CRT-17
  test('API-CRT-17 Toolshop API: removing a product leaves the rest of the cart @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ lines: 2 });
    const [kept, removed] = cart.lines;

    await test.step('Remove the second product via DELETE /carts/{cartId}/product/{productId}', async () => {
      const { status, body } = await apiRequest({
        method: 'DELETE',
        url: ToolshopApi.cartProduct(cart.id, removed.productId),
        baseUrl: api,
      });

      expect(status).toBe(204);
      expect(body).toBeNull();
    });

    await test.step('Read the cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items?.map((item) => item.product_id)).toEqual([kept.productId]);
    });
  });

  // API-CRT-18
  test("API-CRT-18 Toolshop API: removing a product from a cart that doesn't exist is not found @api", async ({
    apiRequest,
  }) => {
    const productId = await catalogueProductId(apiRequest, 0);

    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'DELETE',
      url: ToolshopApi.cartProduct(ToolshopInvalidData.unknownId, productId),
      baseUrl: api,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });

  // API-CRT-19
  test("API-CRT-19 Toolshop API: removing a product that isn't in the cart is not an error @api", async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart();
    const otherProductId = await catalogueProductId(apiRequest, 1);

    await test.step('Remove another product via DELETE /carts/{cartId}/product/{productId}', async () => {
      const { status, body } = await apiRequest({
        method: 'DELETE',
        url: ToolshopApi.cartProduct(cart.id, otherProductId),
        baseUrl: api,
      });

      expect(status).toBe(204);
      expect(body).toBeNull();
    });

    await test.step('Read the cart via GET /carts/{cartId}', async () => {
      const { status, body } = await readCart(apiRequest, cart.id);
      expect(status).toBe(200);
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.cart_items?.map((item) => item.product_id)).toEqual([cart.lines[0].productId]);
    });
  });
});

test.describe('DELETE /carts/{cartId}', () => {
  // API-CRT-20
  test('API-CRT-20 Toolshop API: a deleted cart is gone @api', async ({ apiRequest, newToolshopCart }) => {
    const cart = await newToolshopCart();

    await test.step('Delete the cart via DELETE /carts/{cartId}', async () => {
      const { status, body } = await apiRequest({
        method: 'DELETE',
        url: `${ToolshopApi.CARTS}/${cart.id}`,
        baseUrl: api,
      });

      expect(status).toBe(204);
      expect(body).toBeNull();
    });

    await test.step('Read the deleted cart via GET /carts/{cartId}', async () => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'GET',
        url: `${ToolshopApi.CARTS}/${cart.id}`,
        baseUrl: api,
      });
      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    });
  });

  // API-CRT-21
  test("API-CRT-21 Toolshop API: deleting a cart that doesn't exist is not found @api", async ({ apiRequest }) => {
    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'DELETE',
      url: `${ToolshopApi.CARTS}/${ToolshopInvalidData.unknownId}`,
      baseUrl: api,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('Unsupported methods on the cart address', () => {
  // API-CRT-22
  test('API-CRT-22 Toolshop API: listing all carts is not allowed @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<MethodNotAllowedResponse>({
      method: 'GET',
      url: ToolshopApi.CARTS,
      baseUrl: api,
    });

    expect(status).toBe(405);
    expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
  });
});
