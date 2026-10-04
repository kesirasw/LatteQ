import { test as base } from '@playwright/test';
import { apiRequest } from './plain-function';
import { ENV } from '../../data/env';
import { ToolshopApi } from '../../data/api-endpoints';
import { newToolshopCustomer, type ToolshopCustomerData } from '../../data/toolshop-data';
import { UserResponseSchema } from './schemas/toolshop/userSchema';

export type ToolshopCustomer = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** "First Last", as shown in the site's user menu */
  fullName: string;
  data: ToolshopCustomerData;
};

type ToolshopFixtures = {
  /**
   * A brand-new Toolshop customer, registered through the API for this test only.
   * Gives every test its own account (and cart), so tests never share state on the public demo.
   * No teardown: deleting users needs the admin account, and throwaway accounts are expected on this practice site.
   */
  toolshopCustomer: ToolshopCustomer;
};

export const test = base.extend<ToolshopFixtures>({
  toolshopCustomer: async ({ request }, use) => {
    const data = newToolshopCustomer();
    const { status, body } = await apiRequest({
      request,
      method: 'POST',
      url: ToolshopApi.REGISTER,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: data,
    });
    if (status !== 201) throw new Error(`Registering a Toolshop customer failed: ${status} ${JSON.stringify(body)}`);
    UserResponseSchema.parse(body);

    await use({
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: `${data.first_name} ${data.last_name}`,
      data,
    });
  },
});
