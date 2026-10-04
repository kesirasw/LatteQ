/**
 * API endpoint paths, one object per site. Base URLs live in ENV (data/env.ts).
 * Every path here is listed in the site's OpenAPI contract. Add new ones from the contract, never from guesses.
 */

/** Toolshop: https://api.practicesoftwaretesting.com/docs?api-docs.json (checked 2026-10-04) */
export const ToolshopApi = {
  LOGIN: '/users/login', // POST
  LOGOUT: '/users/logout', // GET
  CURRENT_USER: '/users/me', // GET
  REGISTER: '/users/register', // POST
  PRODUCTS: '/products', // GET, POST
  CARTS: '/carts', // POST
  PAYMENT_CHECK: '/payment/check', // POST
  INVOICES: '/invoices', // GET, POST
} as const;
