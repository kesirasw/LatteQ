import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';
import { ProductSchema } from './productSchema';

/**
 * Toolshop cart, payment and invoice schemas, from the OpenAPI contract.
 * The contract marks no field as required, so fields are optional; `strictObject` rejects undocumented fields.
 * Fields marked FIXME are missing from the contract and were captured live (API test plan, finding 18).
 */

/** POST /carts → 201 (`CartCreatedResponse`) */
export const CartCreatedSchema = z.strictObject({
  id: z.string(),
});

/** POST /carts/{id} and PUT /carts/{cartId}/product/quantity → 200 (`CartItemAddedResponse`) */
export const CartItemAddedSchema = z.strictObject({
  result: z.string().optional(),
});

/** One line of a cart. FIXME: not in contract (`CartResponse` documents only `id`); captured live 2026-10-06. */
export const CartItemSchema = z.strictObject({
  id: z.string(),
  quantity: z.number().int(),
  discount_percentage: z.number().nullable(),
  cart_id: z.string(),
  product_id: z.string(),
  product: ProductSchema,
});

/** GET /carts/{cartId} → 200 (`CartResponse`). Every field but `id` is FIXME: not in contract, captured live 2026-10-06. */
export const CartSchema = z.strictObject({
  id: z.string(),
  additional_discount_percentage: z.number().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  cart_items: z.array(CartItemSchema).optional(),
});

/** POST /payment/check → 200 (`PaymentResponse`) */
export const PaymentResponseSchema = z.strictObject({
  message: z.string().optional(),
});

/** `InvoiceLineResponse` */
export const InvoiceLineSchema = z.strictObject({
  id: z.string().optional(),
  invoice_id: z.string().optional(),
  product_id: z.string().optional(),
  unit_price: z.number().optional(),
  discount_percentage: z.number().nullable().optional(),
  discounted_price: z.number().nullable().optional(),
  quantity: z.number().int().optional(),
  product: ProductSchema.optional(),
});

/**
 * `InvoiceResponse`: POST /invoices and /invoices/guest (contract says 200; the live API answers 201, finding 11),
 * GET /invoices/{invoiceId}, and each item of GET /invoices.
 */
export const InvoiceSchema = z.strictObject({
  id: z.string().optional(),
  // FIXME: contract says text; a guest invoice has no customer, so live it is null (2026-10-06)
  user_id: z.string().nullable().optional(),
  invoice_date: z.string().optional(),
  invoice_number: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_country: z.string().optional(),
  billing_state: z.string().optional(),
  billing_postal_code: z.string().optional(),
  additional_discount_percentage: z.number().nullable().optional(),
  additional_discount_amount: z.number().nullable().optional(),
  // FIXME: eco discount not in contract; captured live 2026-10-06
  eco_discount_percentage: z.number().nullable().optional(),
  eco_discount_amount: z.number().nullable().optional(),
  subtotal: z.number().optional(),
  total: z.number().optional(),
  status: z.string().optional(),
  status_message: z.string().nullable().optional(),
  invoicelines: z.array(InvoiceLineSchema).optional(),
  // FIXME: payment not in contract; captured live 2026-10-06 (details are [] for cash on delivery)
  payment: z
    .strictObject({
      payment_method: z.string(),
      payment_details: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    })
    .optional(),
  created_at: z.string().optional(),
});

/** GET /invoices and GET /invoices/search → 200 (`PaginatedInvoiceResponse`) */
export const PaginatedInvoicesSchema = z.strictObject({
  current_page: z.number().int().optional(),
  data: z.array(InvoiceSchema).optional(),
  from: z.number().int().nullable().optional(),
  last_page: z.number().int().optional(),
  per_page: z.number().int().optional(),
  to: z.number().int().nullable().optional(),
  total: z.number().int().optional(),
});

/**
 * GET /invoices/{invoice_number}/download-pdf-status. The contract documents 200 with an `InvoiceResponse`, which
 * can't describe a status check. FIXME: shape captured live, {"status":"NOT_INITIATED"} (with 400, finding 8).
 */
export const PdfStatusSchema = z.strictObject({
  status: z.string(),
});

export type CartCreated = zOutput<typeof CartCreatedSchema>;
export type CartItemAdded = zOutput<typeof CartItemAddedSchema>;
export type Cart = zOutput<typeof CartSchema>;
export type PaymentResponse = zOutput<typeof PaymentResponseSchema>;
export type Invoice = zOutput<typeof InvoiceSchema>;
export type PaginatedInvoices = zOutput<typeof PaginatedInvoicesSchema>;
export type PdfStatus = zOutput<typeof PdfStatusSchema>;
