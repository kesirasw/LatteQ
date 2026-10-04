import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { ToolshopData } from '../../../data/toolshop-data';
import { LoginResponse, LoginResponseSchema } from '../../../fixtures/api/schemas/toolshop/userSchema';
import { PaginatedProducts, PaginatedProductsSchema } from '../../../fixtures/api/schemas/toolshop/productSchema';
import {
  CartCreated,
  CartCreatedSchema,
  CartItemAdded,
  CartItemAddedSchema,
  PaymentResponse,
  PaymentResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/orderSchema';
import {
  UnauthenticatedResponse,
  UnauthenticatedResponseSchema,
  UnprocessableEntityResponse,
  UnprocessableEntityResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';
import type { ApiRequestFn } from '../../../fixtures/api/api-types';
import type { ToolshopCustomer } from '../../../fixtures/api/toolshop-fixture';

// Plan: test-plans/toolshop/test-cases/07-backend-checks.md

const api = ENV.TOOLSHOP_API_URL;

async function signIn(apiRequest: ApiRequestFn, customer: ToolshopCustomer): Promise<string> {
  const { status, body } = await apiRequest<LoginResponse>({
    method: 'POST',
    url: ToolshopApi.LOGIN,
    baseUrl: api,
    body: { email: customer.email, password: customer.password },
  });
  expect(status).toBe(200);
  expect(LoginResponseSchema.parse(body)).toBeTruthy();
  return body.access_token;
}

async function cartWithOneProduct(apiRequest: ApiRequestFn): Promise<string> {
  const products = await apiRequest<PaginatedProducts>({ method: 'GET', url: ToolshopApi.PRODUCTS, baseUrl: api });
  expect(products.status).toBe(200);
  expect(PaginatedProductsSchema.parse(products.body)).toBeTruthy();
  const productId = products.body.data?.[0]?.id ?? '';

  const cart = await apiRequest<CartCreated>({ method: 'POST', url: ToolshopApi.CARTS, baseUrl: api });
  expect(cart.status).toBe(201);
  expect(CartCreatedSchema.parse(cart.body)).toBeTruthy();

  const added = await apiRequest<CartItemAdded>({
    method: 'POST',
    url: `${ToolshopApi.CARTS}/${cart.body.id}`,
    baseUrl: api,
    body: { product_id: productId, quantity: 1 },
  });
  expect(added.status).toBe(200);
  expect(CartItemAddedSchema.parse(added.body)).toBeTruthy();
  return cart.body.id;
}

/** Billing details as a customer would send them; the address part is overridden per test. */
const invoiceBody = (cartId: string, overrides: Record<string, unknown>) => ({
  billing_street: 'Marvin-Krenn-Gasse',
  billing_city: 'Mittersill',
  billing_state: 'Vorarlberg',
  billing_country: ToolshopData.address.countryCode,
  billing_postal_code: ToolshopData.address.postalCode,
  payment_method: 'cash-on-delivery',
  payment_details: {},
  cart_id: cartId,
  ...overrides,
});

test.describe('POST /payment/check', () => {
  // TC-API-03
  test('TC-API-03 Toolshop API: a cash-on-delivery payment check is accepted @api', async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    let token = '';

    await test.step('Sign in via POST /users/login', async () => {
      token = await signIn(apiRequest, toolshopCustomer);
    });

    await test.step('Check payment via POST /payment/check', async () => {
      const { status, body } = await apiRequest<PaymentResponse>({
        method: 'POST',
        url: ToolshopApi.PAYMENT_CHECK,
        baseUrl: api,
        headers: token,
        body: { payment_method: 'cash-on-delivery', payment_details: {} },
      });

      expect(status).toBe(200);
      expect(PaymentResponseSchema.parse(body)).toBeTruthy();
    });
  });
});

test.describe('POST /invoices', () => {
  // TC-API-04
  test("TC-API-04 Toolshop API: a state that doesn't match the country is refused @api", async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    let token = '';
    let cartId = '';

    await test.step('Sign in via POST /users/login', async () => {
      token = await signIn(apiRequest, toolshopCustomer);
    });

    await test.step('Create a cart with one product via POST /carts', async () => {
      cartId = await cartWithOneProduct(apiRequest);
    });

    await test.step('Create an invoice with a mismatched state via POST /invoices', async () => {
      const { status, body } = await apiRequest<UnprocessableEntityResponse>({
        method: 'POST',
        url: ToolshopApi.INVOICES,
        baseUrl: api,
        headers: token,
        body: invoiceBody(cartId, { billing_state: ToolshopData.mismatchedState }),
      });

      expect(status).toBe(422);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      expect(body.billing_country?.join(' ')).toMatch(/does not belong to the selected country/);
    });
  });

  // TC-API-05
  test('TC-API-05 Toolshop API: an order without a valid sign-in is refused @api', async ({ apiRequest }) => {
    let cartId = '';

    await test.step('Create a cart with one product via POST /carts', async () => {
      cartId = await cartWithOneProduct(apiRequest);
    });

    for (const [description, token] of [
      ['no access token', undefined],
      ['an expired or invalid token', 'expired.session.token'],
    ] as const) {
      await test.step(`Create an invoice with ${description} via POST /invoices`, async () => {
        const { status, body } = await apiRequest<UnauthenticatedResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: token,
          body: invoiceBody(cartId, {}),
        });

        expect(status).toBe(401);
        expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });
});
