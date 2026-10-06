/**
 * API endpoint paths, one object per site. Base URLs live in ENV (data/env.ts).
 * Every path here is listed in the site's OpenAPI contract. Add new ones from the contract, never from guesses.
 */

/** Toolshop: https://api.practicesoftwaretesting.com/docs?api-docs.json (checked 2026-10-06) */
export const ToolshopApi = {
  LOGIN: '/users/login', // POST
  LOGOUT: '/users/logout', // GET
  REFRESH: '/users/refresh', // GET
  CURRENT_USER: '/users/me', // GET
  REGISTER: '/users/register', // POST
  CHANGE_PASSWORD: '/users/change-password', // POST
  FORGOT_PASSWORD: '/users/forgot-password', // POST
  USERS: '/users', // GET; /users/{userId}: GET, PUT, PATCH, DELETE
  USER_SEARCH: '/users/search', // GET
  PRODUCTS: '/products', // GET, POST; /products/{productId}: GET, PUT, PATCH, DELETE
  PRODUCT_SEARCH: '/products/search', // GET
  relatedProducts: (productId: string) => `/products/${productId}/related`, // GET
  CARTS: '/carts', // POST; /carts/{id}: POST (add item), GET, DELETE
  cartQuantity: (cartId: string) => `/carts/${cartId}/product/quantity`, // PUT
  cartProduct: (cartId: string, productId: string) => `/carts/${cartId}/product/${productId}`, // DELETE
  PAYMENT_CHECK: '/payment/check', // POST
  INVOICES: '/invoices', // GET, POST; /invoices/{invoiceId}: GET, PUT, PATCH
  GUEST_INVOICE: '/invoices/guest', // POST
  INVOICE_SEARCH: '/invoices/search', // GET
  invoiceStatus: (invoiceId: string) => `/invoices/${invoiceId}/status`, // PUT
  invoicePdf: (invoiceNumber: string) => `/invoices/${invoiceNumber}/download-pdf`, // GET
  invoicePdfStatus: (invoiceNumber: string) => `/invoices/${invoiceNumber}/download-pdf-status`, // GET
} as const;
