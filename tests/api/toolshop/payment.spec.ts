/* eslint-disable playwright/no-skipped-test -- FIXME-parked tests (api-testing skill, Phase 7) */
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { ToolshopData, ToolshopMessages } from '../../../data/toolshop-data';
import { ToolshopInvalidData } from '../../../data/toolshop-invalid-data';
import { PaymentResponse, PaymentResponseSchema } from '../../../fixtures/api/schemas/toolshop/orderSchema';
import {
  ValidationErrorResponse,
  ValidationErrorResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';

// Plan: test-plans/toolshop/api/test-cases/04-payment.md (TC-API-03 in orders.spec.ts covers a signed-in cash payment)

const api = ENV.TOOLSHOP_API_URL;
const { paymentDetails } = ToolshopData;

test.describe('POST /payment/check', () => {
  // API-PAY-01
  for (const [method, details] of Object.entries(paymentDetails)) {
    test(`API-PAY-01 Toolshop API: a ${method} payment with valid details is accepted @api`, async ({ apiRequest }) => {
      const { status, body } = await apiRequest<PaymentResponse>({
        method: 'POST',
        url: ToolshopApi.PAYMENT_CHECK,
        baseUrl: api,
        body: { payment_method: method, payment_details: details },
      });

      expect(status).toBe(200);
      expect(PaymentResponseSchema.parse(body)).toBeTruthy();
      expect(body.message).toBe(ToolshopMessages.paymentSuccess);
    });
  }

  // API-PAY-02 to API-PAY-07 — the contract documents only 200 for this operation (finding 14)
  for (const { caseId, description, method, details, fields } of [
    {
      caseId: 'API-PAY-02',
      description: 'a credit card without its details',
      method: 'credit-card',
      details: {},
      fields: [
        'payment_details.card_holder_name',
        'payment_details.credit_card_number',
        'payment_details.cvv',
        'payment_details.expiration_date',
      ],
    },
    {
      caseId: 'API-PAY-03',
      description: 'a badly formed credit card number',
      method: 'credit-card',
      details: { ...paymentDetails['credit-card'], credit_card_number: 'abc' },
      fields: ['payment_details.credit_card_number'],
    },
    {
      caseId: 'API-PAY-04',
      description: 'an expired credit card',
      method: 'credit-card',
      details: { ...paymentDetails['credit-card'], expiration_date: '01/2020' },
      fields: ['payment_details.expiration_date'],
    },
    {
      caseId: 'API-PAY-05',
      description: 'a badly formed gift card',
      method: 'gift-card',
      details: { gift_card_number: '123', validation_code: '1' },
      fields: ['payment_details.gift_card_number', 'payment_details.validation_code'],
    },
    {
      caseId: 'API-PAY-06',
      description: 'a bank transfer without its details',
      method: 'bank-transfer',
      details: {},
      fields: ['payment_details.account_name', 'payment_details.account_number', 'payment_details.bank_name'],
    },
    {
      caseId: 'API-PAY-07',
      description: 'buy now, pay later without instalments',
      method: 'buy-now-pay-later',
      details: {},
      fields: ['payment_details.monthly_installments'],
    },
  ]) {
    test(`${caseId} Toolshop API: ${description} is refused @api`, async ({ apiRequest }) => {
      const { status, body } = await apiRequest<ValidationErrorResponse>({
        method: 'POST',
        url: ToolshopApi.PAYMENT_CHECK,
        baseUrl: api,
        body: { payment_method: method, payment_details: details },
      });

      expect(status).toBe(422);
      expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
      expect(Object.keys(body.errors).sort()).toEqual(fields);
    });
  }

  // API-PAY-08
  // FIXME: an empty payment check answers 200 "Payment was successful" (API test plan, finding 14; seen 2026-10-06)
  test.skip('API-PAY-08 Toolshop API: an empty payment check is refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: ToolshopApi.PAYMENT_CHECK,
      baseUrl: api,
      body: {},
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors)).toContain('payment_method');
  });

  // API-PAY-09
  for (const method of ToolshopInvalidData.unknownPaymentMethods) {
    // FIXME: a payment method outside the contract's list answers 200 "Payment was successful"
    // (API test plan, finding 14; seen 2026-10-06)
    test.skip(`API-PAY-09 Toolshop API: payment method ${JSON.stringify(method)} is refused @api`, async ({
      apiRequest,
    }) => {
      const { status, body } = await apiRequest<ValidationErrorResponse>({
        method: 'POST',
        url: ToolshopApi.PAYMENT_CHECK,
        baseUrl: api,
        body: { payment_method: method, payment_details: {} },
      });

      expect(status).toBe(422);
      expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
      expect(Object.keys(body.errors)).toEqual(['payment_method']);
    });
  }

  // API-PAY-10
  // FIXME: payment details sent as text answer 200 "Payment was successful" (API test plan, finding 14; seen 2026-10-06)
  test.skip('API-PAY-10 Toolshop API: payment details that are text are refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: ToolshopApi.PAYMENT_CHECK,
      baseUrl: api,
      body: { payment_method: 'cash-on-delivery', payment_details: 'not a set of details' },
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors)).toContain('payment_details');
  });
});
