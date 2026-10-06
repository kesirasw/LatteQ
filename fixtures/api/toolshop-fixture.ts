import { test as base, type APIRequestContext } from '@playwright/test';
import { apiRequest } from './plain-function';
import { ENV } from '../../data/env';
import { ToolshopApi } from '../../data/api-endpoints';
import { newToolshopCustomer, type ToolshopCustomerData } from '../../data/toolshop-data';
import { LoginResponseSchema, UserResponseSchema } from './schemas/toolshop/userSchema';
import { CartCreatedSchema, CartItemAddedSchema } from './schemas/toolshop/orderSchema';
import { PaginatedProductsSchema, type Product } from './schemas/toolshop/productSchema';

export type ToolshopCustomer = {
  /** User ID the API assigned at registration */
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** "First Last", as shown in the site's user menu */
  fullName: string;
  data: ToolshopCustomerData;
};

/** A registered customer plus a fresh access key (valid for 300 s). */
export type ToolshopSession = {
  customer: ToolshopCustomer;
  token: string;
};

export type ToolshopCartLine = { productId: string; name: string; price: number; quantity: number };

/** A cart holding the first `lines` products of the catalogue's first page. */
export type ToolshopCart = {
  id: string;
  lines: ToolshopCartLine[];
};

type ToolshopFixtures = {
  /**
   * A brand-new Toolshop customer, registered through the API for this test only.
   * Gives every test its own account (and cart), so tests never share state on the public demo.
   * No teardown: deleting users needs the admin account, and throwaway accounts are expected on this practice site.
   */
  toolshopCustomer: ToolshopCustomer;
  /** Registers another new customer and logs them in. Call it once per customer the test needs. */
  newToolshopSession: () => Promise<ToolshopSession>;
  /**
   * Creates a cart with `lines` different products (quantity `quantity` each), taken live from the catalogue
   * because the demo's IDs change on every reset. Every cart it creates is deleted after the test.
   */
  newToolshopCart: (options?: { lines?: number; quantity?: number }) => Promise<ToolshopCart>;
};

const api = ENV.TOOLSHOP_API_URL;

async function registerCustomer(request: APIRequestContext): Promise<ToolshopCustomer> {
  const data = newToolshopCustomer();
  const { status, body } = await apiRequest({
    request,
    method: 'POST',
    url: ToolshopApi.REGISTER,
    baseUrl: api,
    body: data,
  });
  if (status !== 201) throw new Error(`Registering a Toolshop customer failed: ${status} ${JSON.stringify(body)}`);
  const user = UserResponseSchema.parse(body);

  return {
    id: user.id ?? '',
    email: data.email,
    password: data.password,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: `${data.first_name} ${data.last_name}`,
    data,
  };
}

export const test = base.extend<ToolshopFixtures>({
  toolshopCustomer: async ({ request }, use) => {
    await use(await registerCustomer(request));
  },

  newToolshopSession: async ({ request }, use) => {
    await use(async () => {
      const customer = await registerCustomer(request);
      const { status, body } = await apiRequest({
        request,
        method: 'POST',
        url: ToolshopApi.LOGIN,
        baseUrl: api,
        body: { email: customer.email, password: customer.password },
      });
      if (status !== 200)
        throw new Error(`Logging in a new Toolshop customer failed: ${status} ${JSON.stringify(body)}`);
      return { customer, token: LoginResponseSchema.parse(body).access_token };
    });
  },

  newToolshopCart: async ({ request }, use) => {
    const created: string[] = [];

    await use(async ({ lines = 1, quantity = 1 } = {}) => {
      const products = await apiRequest({ request, method: 'GET', url: ToolshopApi.PRODUCTS, baseUrl: api });
      if (products.status !== 200) throw new Error(`Listing Toolshop products failed: ${products.status}`);
      const picked: Product[] = (PaginatedProductsSchema.parse(products.body).data ?? []).slice(0, lines);
      if (picked.length < lines) throw new Error(`Only ${picked.length} products available, ${lines} needed`);

      const cart = await apiRequest({ request, method: 'POST', url: ToolshopApi.CARTS, baseUrl: api });
      if (cart.status !== 201) throw new Error(`Creating a Toolshop cart failed: ${cart.status}`);
      const cartId = CartCreatedSchema.parse(cart.body).id;
      created.push(cartId);

      for (const product of picked) {
        const added = await apiRequest({
          request,
          method: 'POST',
          url: `${ToolshopApi.CARTS}/${cartId}`,
          baseUrl: api,
          body: { product_id: product.id, quantity },
        });
        if (added.status !== 200) throw new Error(`Adding to a Toolshop cart failed: ${added.status}`);
        CartItemAddedSchema.parse(added.body);
      }

      return {
        id: cartId,
        lines: picked.map((p) => ({ productId: p.id ?? '', name: p.name ?? '', price: p.price ?? 0, quantity })),
      };
    });

    // Teardown: delete every cart this test created. A cart the test already deleted answers 404, which is fine.
    for (const cartId of created) {
      await apiRequest({ request, method: 'DELETE', url: `${ToolshopApi.CARTS}/${cartId}`, baseUrl: api });
    }
  },
});
