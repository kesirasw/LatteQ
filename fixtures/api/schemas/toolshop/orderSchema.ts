import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/**
 * Toolshop cart, payment and invoice schemas, from the OpenAPI contract.
 * The contract marks no field as required, so fields are optional; `strictObject` rejects undocumented fields.
 */

/** POST /carts → 201 (`CartCreatedResponse`) */
export const CartCreatedSchema = z.strictObject({
  id: z.string(),
});

/** POST /carts/{id} → 200 (`CartItemAddedResponse`) */
export const CartItemAddedSchema = z.strictObject({
  result: z.string().optional(),
});

/** POST /payment/check → 200 (`PaymentResponse`) */
export const PaymentResponseSchema = z.strictObject({
  message: z.string().optional(),
});

/** POST /invoices → `InvoiceResponse` (contract says 200; the live API answers 201, see the API test) */
export const InvoiceSchema = z.strictObject({
  id: z.string().optional(),
  user_id: z.string().optional(),
  invoice_date: z.string().optional(),
  invoice_number: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_country: z.string().optional(),
  billing_state: z.string().optional(),
  billing_postal_code: z.string().optional(),
  additional_discount_percentage: z.number().nullable().optional(),
  additional_discount_amount: z.number().nullable().optional(),
  subtotal: z.number().optional(),
  total: z.number().optional(),
  status: z.string().optional(),
  status_message: z.string().nullable().optional(),
  // InvoiceLineResponse items are checked for presence only; their shape isn't asserted by these tests
  invoicelines: z.array(z.unknown()).optional(),
  created_at: z.string().optional(),
});

export type CartCreated = zOutput<typeof CartCreatedSchema>;
export type CartItemAdded = zOutput<typeof CartItemAddedSchema>;
export type PaymentResponse = zOutput<typeof PaymentResponseSchema>;
export type Invoice = zOutput<typeof InvoiceSchema>;
