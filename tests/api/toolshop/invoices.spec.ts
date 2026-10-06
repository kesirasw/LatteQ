/* eslint-disable playwright/no-skipped-test -- FIXME-parked tests (api-testing skill, Phase 7) */
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { ToolshopData } from '../../../data/toolshop-data';
import { ToolshopInvalidData } from '../../../data/toolshop-invalid-data';
import {
  Invoice,
  InvoiceSchema,
  PaginatedInvoices,
  PaginatedInvoicesSchema,
  PdfStatus,
  PdfStatusSchema,
} from '../../../fixtures/api/schemas/toolshop/orderSchema';
import {
  ForbiddenResponse,
  ForbiddenResponseSchema,
  MethodNotAllowedResponse,
  MethodNotAllowedResponseSchema,
  NotFoundResponse,
  NotFoundResponseSchema,
  UnauthenticatedResponse,
  UnauthenticatedResponseSchema,
  UnprocessableEntityResponse,
  UnprocessableEntityResponseSchema,
  ValidationErrorResponse,
  ValidationErrorResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';
import type { ApiRequestFn, ApiRequestParams } from '../../../fixtures/api/api-types';
import type { ToolshopCart } from '../../../fixtures/api/toolshop-fixture';

// Plan: test-plans/toolshop/api/test-cases/05-invoices.md
// TC-API-04 (state not in country) and TC-API-05 (no valid sign-in) live in orders.spec.ts

const api = ENV.TOOLSHOP_API_URL;
const { billingAddress, address } = ToolshopData;

/** A complete, valid order for `cartId`: the address the postcode lookup accepts, cash on delivery. */
const invoiceBody = (cartId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  billing_street: billingAddress.street,
  billing_city: billingAddress.city,
  billing_state: billingAddress.state,
  billing_country: address.countryCode,
  billing_postal_code: address.postalCode,
  payment_method: 'cash-on-delivery',
  payment_details: {},
  cart_id: cartId,
  ...overrides,
});

/** The expected total of a cart, rounded the way prices are (two decimals). */
const cartTotal = (cart: ToolshopCart) =>
  Math.round(cart.lines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;

async function placeOrder(apiRequest: ApiRequestFn, token: string, cartId: string): Promise<Invoice> {
  const { status, body } = await apiRequest<Invoice>({
    method: 'POST',
    url: ToolshopApi.INVOICES,
    baseUrl: api,
    headers: token,
    body: invoiceBody(cartId),
  });
  // The contract documents 200; the API answers 201 Created, the better code for a new invoice (finding 11)
  expect(status).toBe(201);
  expect(InvoiceSchema.parse(body)).toBeTruthy();
  return body;
}

test.describe('POST /invoices', () => {
  // API-INV-01
  test('API-INV-01 Toolshop API: placing an order creates an invoice for the cart @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart({ quantity: 2 });

    const { status, body } = await apiRequest<Invoice>({
      method: 'POST',
      url: ToolshopApi.INVOICES,
      baseUrl: api,
      headers: me.token,
      body: invoiceBody(cart.id),
    });

    // The contract documents 200; the API answers 201 Created, the better code for a new invoice (finding 11)
    expect(status).toBe(201);
    expect(InvoiceSchema.parse(body)).toBeTruthy();
    expect(body.invoice_number).toMatch(/^INV-\d+$/);
    expect(body).toMatchObject({
      user_id: me.customer.id,
      billing_street: billingAddress.street,
      billing_city: billingAddress.city,
      billing_state: billingAddress.state,
      billing_country: address.countryCode,
      billing_postal_code: address.postalCode,
    });
    expect(body.total).toBeCloseTo(cartTotal(cart), 2);
  });

  // API-INV-07 — the API names six details; state and postal code aren't enforced (API-INV-08, finding 15)
  test('API-INV-07 Toolshop API: placing an order with an empty request names the missing details @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<UnprocessableEntityResponse>({
      method: 'POST',
      url: ToolshopApi.INVOICES,
      baseUrl: api,
      headers: me.token,
      body: {},
    });

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body)).toEqual(
      expect.arrayContaining([
        'billing_street',
        'billing_city',
        'billing_country',
        'payment_method',
        'payment_details',
        'cart_id',
      ]),
    );
  });

  // API-INV-08
  test('API-INV-08 Toolshop API: placing an order without each enforced detail is refused @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();

    for (const field of [
      'billing_street',
      'billing_city',
      'billing_country',
      'payment_method',
      'payment_details',
      'cart_id',
    ]) {
      await test.step(`Place an order without ${field} via POST /invoices`, async () => {
        const { [field]: _omitted, ...withoutField } = invoiceBody(cart.id);

        const { status, body } = await apiRequest<UnprocessableEntityResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: me.token,
          body: withoutField,
        });

        expect(status).toBe(422);
        expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body)).toEqual([field]);
      });
    }
  });

  // API-INV-08
  // FIXME: orders without billing_state or billing_postal_code are accepted (201) although the contract requires both
  // (API test plan, finding 15; seen 2026-10-06)
  test.skip('API-INV-08 Toolshop API: placing an order without a state or postal code is refused @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();

    for (const field of ['billing_state', 'billing_postal_code']) {
      await test.step(`Place an order without ${field} via POST /invoices`, async () => {
        const { [field]: _omitted, ...withoutField } = invoiceBody(cart.id);

        const { status, body } = await apiRequest<UnprocessableEntityResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: me.token,
          body: withoutField,
        });

        expect(status).toBe(422);
        expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body)).toContain(field);
      });
    }
  });

  // API-INV-09, API-INV-10
  test('API-INV-09 Toolshop API: placing an order with the wrong kind of value is refused @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();

    for (const { caseId, field, value, message } of [
      ...['billing_street', 'billing_city', 'billing_state', 'billing_country', 'billing_postal_code'].map((field) => ({
        caseId: 'API-INV-09',
        field,
        value: 123 as unknown,
        message: /must be a string/,
      })),
      ...ToolshopInvalidData.unknownPaymentMethods.map((value) => ({
        caseId: 'API-INV-10',
        field: 'payment_method',
        value: value as unknown,
        message: /payment method is invalid/,
      })),
    ]) {
      await test.step(`${caseId}: ${field} = ${JSON.stringify(value)} via POST /invoices`, async () => {
        const { status, body } = await apiRequest<UnprocessableEntityResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: me.token,
          body: invoiceBody(cart.id, { [field]: value }),
        });

        expect(status).toBe(422);
        expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
        expect(body[field]?.join(' ')).toMatch(message);
      });
    }
  });

  // API-INV-11
  // FIXME: payment details that don't fit the method crash the server (500) instead of a 422
  // (API test plan, finding 7; seen 2026-10-06)
  test.skip("API-INV-11 Toolshop API: payment details that don't fit the payment method are refused @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();

    for (const [method, details] of [
      ['credit-card', {}],
      ['cash-on-delivery', 'not a set of details'],
    ] as const) {
      await test.step(`Place a ${method} order with details ${JSON.stringify(details)} via POST /invoices`, async () => {
        const { status, body } = await apiRequest<UnprocessableEntityResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: me.token,
          body: invoiceBody(cart.id, { payment_method: method, payment_details: details }),
        });

        expect(status).toBe(422);
        expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });

  // API-INV-12
  test("API-INV-12 Toolshop API: placing an order for a cart that doesn't exist is not found @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    for (const [description, cartId] of [
      ["a well-formed cart ID that doesn't exist", ToolshopInvalidData.unknownId],
      ['a number instead of an ID', 123],
    ] as const) {
      await test.step(`Place an order with ${description} via POST /invoices`, async () => {
        const { status, body } = await apiRequest<NotFoundResponse>({
          method: 'POST',
          url: ToolshopApi.INVOICES,
          baseUrl: api,
          headers: me.token,
          body: invoiceBody('', { cart_id: cartId }),
        });

        expect(status).toBe(404);
        expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });

  // API-INV-13
  // FIXME: a second order for an already-ordered cart creates a second invoice (201); the customer pays twice
  // (API test plan, finding 4; seen 2026-10-06)
  test.skip("API-INV-13 Toolshop API: the same cart can't be ordered twice @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();

    await test.step('Place an order via POST /invoices', async () => {
      await placeOrder(apiRequest, me.token, cart.id);
    });

    await test.step('Order the same cart again via POST /invoices', async () => {
      const { status, body } = await apiRequest<UnprocessableEntityResponse>({
        method: 'POST',
        url: ToolshopApi.INVOICES,
        baseUrl: api,
        headers: me.token,
        body: invoiceBody(cart.id),
      });

      // Needs confirming: 409 Conflict or 422 Unprocessable Entity
      expect([409, 422]).toContain(status);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('List my invoices via GET /invoices', async () => {
      const { status, body } = await apiRequest<PaginatedInvoices>({
        method: 'GET',
        url: ToolshopApi.INVOICES,
        baseUrl: api,
        headers: me.token,
      });
      expect(status).toBe(200);
      expect(PaginatedInvoicesSchema.parse(body)).toBeTruthy();
      expect(body.total).toBe(1);
    });
  });
});

test.describe('Reading my invoices', () => {
  // API-INV-02
  test('API-INV-02 Toolshop API: a new order appears in my invoice list @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart({ quantity: 2 });
    let invoice: Invoice = {};

    await test.step('Place an order via POST /invoices', async () => {
      invoice = await placeOrder(apiRequest, me.token, cart.id);
    });

    await test.step('List my invoices via GET /invoices', async () => {
      const { status, body } = await apiRequest<PaginatedInvoices>({
        method: 'GET',
        url: ToolshopApi.INVOICES,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(200);
      expect(PaginatedInvoicesSchema.parse(body)).toBeTruthy();
      expect(body.data?.map((i) => [i.invoice_number, i.total])).toEqual([[invoice.invoice_number, invoice.total]]);
    });
  });

  // API-INV-03
  test('API-INV-03 Toolshop API: my invoice reads back with its lines, status and payment @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart({ quantity: 2 });
    const [line] = cart.lines;
    let invoice: Invoice = {};

    await test.step('Place an order via POST /invoices', async () => {
      invoice = await placeOrder(apiRequest, me.token, cart.id);
    });

    await test.step('Read the invoice via GET /invoices/{invoiceId}', async () => {
      const { status, body } = await apiRequest<Invoice>({
        method: 'GET',
        url: `${ToolshopApi.INVOICES}/${invoice.id}`,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(200);
      expect(InvoiceSchema.parse(body)).toBeTruthy();
      expect(body).toMatchObject({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        status: 'AWAITING_FULFILLMENT',
      });
      expect(body.invoicelines?.map((l) => [l.product_id, l.quantity, l.unit_price])).toEqual([
        [line.productId, 2, line.price],
      ]);
      expect(body.payment?.payment_method).toBe('cash-on-delivery');
    });
  });

  // API-INV-04
  test("API-INV-04 Toolshop API: another customer can't see my order @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    let invoice: Invoice = {};

    await test.step('Place an order via POST /invoices', async () => {
      invoice = await placeOrder(apiRequest, me.token, cart.id);
    });

    const other = await newToolshopSession();

    await test.step('Read the invoice as another customer via GET /invoices/{invoiceId}', async () => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'GET',
        url: `${ToolshopApi.INVOICES}/${invoice.id}`,
        baseUrl: api,
        headers: other.token,
      });
      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
    });

    for (const [description, url] of [
      ['List invoices', ToolshopApi.INVOICES],
      ['Search for the invoice number', `${ToolshopApi.INVOICE_SEARCH}?q=${invoice.invoice_number}`],
    ] as const) {
      await test.step(`${description} as another customer via GET ${url.split('?')[0]}`, async () => {
        const { status, body } = await apiRequest<PaginatedInvoices>({
          method: 'GET',
          url,
          baseUrl: api,
          headers: other.token,
        });
        expect(status).toBe(200);
        expect(PaginatedInvoicesSchema.parse(body)).toBeTruthy();
        expect(body.data).toEqual([]);
      });
    }
  });

  // API-INV-05, API-INV-06
  test("API-INV-05 Toolshop API: invoices that don't exist or have badly formed IDs are not found @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    for (const { description, value } of [
      { description: "a well-formed ID that doesn't exist", value: ToolshopInvalidData.unknownId },
      ...ToolshopInvalidData.malformedIds,
    ]) {
      await test.step(`Read an invoice with ${description} via GET /invoices/{invoiceId}`, async () => {
        const { status, body } = await apiRequest<NotFoundResponse>({
          method: 'GET',
          url: `${ToolshopApi.INVOICES}/${encodeURIComponent(value)}`,
          baseUrl: api,
          headers: me.token,
        });

        expect(status).toBe(404);
        expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });

  // API-INV-17
  test('API-INV-17 Toolshop API: searching my invoices by number finds the order @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    let invoice: Invoice = {};

    await test.step('Place an order via POST /invoices', async () => {
      invoice = await placeOrder(apiRequest, me.token, cart.id);
    });

    await test.step('Search for the invoice number via GET /invoices/search', async () => {
      const { status, body } = await apiRequest<PaginatedInvoices>({
        method: 'GET',
        url: `${ToolshopApi.INVOICE_SEARCH}?q=${invoice.invoice_number}`,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(200);
      expect(PaginatedInvoicesSchema.parse(body)).toBeTruthy();
      expect(body.data?.map((i) => i.invoice_number)).toEqual([invoice.invoice_number]);
    });
  });

  // API-INV-18
  // FIXME: a search without a phrase returns all the customer's invoices (200); the contract makes q required
  // (API test plan, finding 16; seen 2026-10-06)
  test.skip('API-INV-18 Toolshop API: searching invoices without a search phrase is refused @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'GET',
      url: ToolshopApi.INVOICE_SEARCH,
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('Invoice operations without a valid access key', () => {
  // API-INV-14 (placing an order without one is TC-API-05)
  test('API-INV-14 Toolshop API: invoice operations refuse a missing or invalid access key @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    const invoice = await placeOrder(apiRequest, me.token, cart.id);
    const invoiceUrl = `${ToolshopApi.INVOICES}/${invoice.id}`;
    const number = invoice.invoice_number ?? '';

    const operations: Omit<ApiRequestParams, 'baseUrl' | 'headers'>[] = [
      { method: 'GET', url: ToolshopApi.INVOICES },
      { method: 'GET', url: invoiceUrl },
      { method: 'PUT', url: invoiceUrl, body: invoiceBody(cart.id) },
      { method: 'PATCH', url: invoiceUrl, body: { billing_city: 'Elsewhere' } },
      { method: 'PUT', url: ToolshopApi.invoiceStatus(invoice.id ?? ''), body: { status: 'SHIPPED' } },
      { method: 'GET', url: `${ToolshopApi.INVOICE_SEARCH}?q=${number}` },
      { method: 'GET', url: ToolshopApi.invoicePdfStatus(number) },
      { method: 'GET', url: ToolshopApi.invoicePdf(number) },
    ];

    for (const operation of operations) {
      for (const [keyDescription, token] of [
        ['no access key', undefined],
        ['an invalid access key', ToolshopInvalidData.invalidToken],
      ] as const) {
        await test.step(`${operation.method} ${operation.url} with ${keyDescription}`, async () => {
          const { status, body } = await apiRequest<UnauthenticatedResponse>({
            ...operation,
            baseUrl: api,
            headers: token,
          });

          expect(status).toBe(401);
          expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
        });
      }
    }
  });
});

test.describe('Changing invoices as a customer', () => {
  // API-INV-15
  // FIXME: a customer can replace and change their own issued invoice (200); should be admin-only
  // (API test plan, finding 3; seen 2026-10-06)
  test.skip("API-INV-15 Toolshop API: a customer can't change an invoice @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    const invoice = await placeOrder(apiRequest, me.token, cart.id);

    // PUT re-sends the same valid details: a new city would fail address validation (422) before the permission check
    for (const [method, change] of [
      ['PUT', invoiceBody(cart.id)],
      ['PATCH', { billing_city: 'Elsewhere' }],
    ] as const) {
      await test.step(`Change the invoice via ${method} /invoices/{invoiceId}`, async () => {
        const { status, body } = await apiRequest<ForbiddenResponse>({
          method,
          url: `${ToolshopApi.INVOICES}/${invoice.id}`,
          baseUrl: api,
          headers: me.token,
          body: change,
        });

        expect(status).toBe(403);
        expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });

  // API-INV-16
  // FIXME: a customer can set their own order to SHIPPED (200); should be admin-only (API test plan, finding 3;
  // seen 2026-10-06)
  test.skip("API-INV-16 Toolshop API: a customer can't change an invoice's status @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    const invoice = await placeOrder(apiRequest, me.token, cart.id);

    await test.step('Set the status to SHIPPED via PUT /invoices/{invoiceId}/status', async () => {
      const { status, body } = await apiRequest<ForbiddenResponse>({
        method: 'PUT',
        url: ToolshopApi.invoiceStatus(invoice.id ?? ''),
        baseUrl: api,
        headers: me.token,
        body: { status: 'SHIPPED', status_message: 'Sent out today' },
      });

      expect(status).toBe(403);
      expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('Read the invoice via GET /invoices/{invoiceId}', async () => {
      const { status, body } = await apiRequest<Invoice>({
        method: 'GET',
        url: `${ToolshopApi.INVOICES}/${invoice.id}`,
        baseUrl: api,
        headers: me.token,
      });
      expect(status).toBe(200);
      expect(InvoiceSchema.parse(body)).toBeTruthy();
      expect(body.status).toBe('AWAITING_FULFILLMENT');
    });
  });
});

test.describe('Invoice PDF', () => {
  // API-INV-19
  // FIXME: the PDF status of a new invoice answers 400 {"status":"NOT_INITIATED"}; the contract documents 200
  // (API test plan, finding 8; seen 2026-10-06)
  test.skip('API-INV-19 Toolshop API: the PDF status of a new invoice is reported @api', async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    const invoice = await placeOrder(apiRequest, me.token, cart.id);

    const { status, body } = await apiRequest<PdfStatus>({
      method: 'GET',
      url: ToolshopApi.invoicePdfStatus(invoice.invoice_number ?? ''),
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(200);
    expect(PdfStatusSchema.parse(body)).toBeTruthy();
  });

  // API-INV-20
  test("API-INV-20 Toolshop API: a PDF that hasn't been made yet is not found @api", async ({
    apiRequest,
    newToolshopSession,
    newToolshopCart,
  }) => {
    const me = await newToolshopSession();
    const cart = await newToolshopCart();
    let invoice: Invoice = {};

    await test.step('Place an order via POST /invoices', async () => {
      invoice = await placeOrder(apiRequest, me.token, cart.id);
    });

    await test.step('Download the PDF straight away via GET /invoices/{invoice_number}/download-pdf', async () => {
      const { status, body } = await apiRequest<NotFoundResponse>({
        method: 'GET',
        url: ToolshopApi.invoicePdf(invoice.invoice_number ?? ''),
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(404);
      expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
      expect(body.message).toMatch(/not created/i);
    });
  });

  // API-INV-21
  // FIXME: the PDF status of an unknown invoice answers 400 {"status":"NOT_INITIATED"} instead of the documented 404
  // (API test plan, finding 8; seen 2026-10-06)
  test.skip("API-INV-21 Toolshop API: the PDF status of an invoice that doesn't exist is not found @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<NotFoundResponse>({
      method: 'GET',
      url: ToolshopApi.invoicePdfStatus(ToolshopInvalidData.unknownInvoiceNumber),
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(404);
    expect(NotFoundResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('POST /invoices/guest', () => {
  const guest = { guest_email: 'latteq.guest@example.com', guest_first_name: 'Latte', guest_last_name: 'Guest' };

  // API-INV-22
  test('API-INV-22 Toolshop API: a guest order creates an invoice with no customer linked @api', async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart({ quantity: 2 });

    const { status, body } = await apiRequest<Invoice>({
      method: 'POST',
      url: ToolshopApi.GUEST_INVOICE,
      baseUrl: api,
      body: { ...invoiceBody(cart.id), ...guest },
    });

    // The contract documents 200; the API answers 201 Created (finding 11)
    expect(status).toBe(201);
    expect(InvoiceSchema.parse(body)).toBeTruthy();
    expect(body.invoice_number).toMatch(/^INV-\d+$/);
    expect(body.user_id).toBeNull();
    expect(body).toMatchObject({ billing_city: billingAddress.city, billing_country: address.countryCode });
    expect(body.total).toBeCloseTo(cartTotal(cart), 2);
  });

  // API-INV-23
  test("API-INV-23 Toolshop API: a guest order without the guest's details is refused @api", async ({
    apiRequest,
    newToolshopCart,
  }) => {
    const cart = await newToolshopCart();
    const { guest_email: _omitted, ...withoutEmail } = guest;

    for (const { description, body: requestBody, field } of [
      { description: 'no details at all', body: {}, field: 'payment_method' },
      {
        description: 'no guest email address',
        body: { ...invoiceBody(cart.id), ...withoutEmail },
        field: 'guest_email',
      },
      {
        description: 'a badly formed guest email address',
        body: { ...invoiceBody(cart.id), ...guest, guest_email: ToolshopInvalidData.badlyFormedEmail },
        field: 'guest_email',
      },
    ]) {
      await test.step(`Place a guest order with ${description} via POST /invoices/guest`, async () => {
        const { status, body } = await apiRequest<ValidationErrorResponse>({
          method: 'POST',
          url: ToolshopApi.GUEST_INVOICE,
          baseUrl: api,
          body: requestBody,
        });

        expect(status).toBe(422);
        expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body.errors)).toContain(field);
      });
    }
  });
});

test.describe('Unsupported methods on invoice addresses', () => {
  // API-INV-24
  test('API-INV-24 Toolshop API: deleting invoices is not allowed @api', async ({ apiRequest, newToolshopSession }) => {
    const me = await newToolshopSession();

    for (const url of [`${ToolshopApi.INVOICES}/${ToolshopInvalidData.unknownId}`, ToolshopApi.INVOICES]) {
      await test.step(`DELETE ${url}`, async () => {
        const { status, body } = await apiRequest<MethodNotAllowedResponse>({
          method: 'DELETE',
          url,
          baseUrl: api,
          headers: me.token,
        });

        expect(status).toBe(405);
        expect(MethodNotAllowedResponseSchema.parse(body)).toBeTruthy();
      });
    }
  });
});
