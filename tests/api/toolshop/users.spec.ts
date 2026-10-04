import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { LoginResponse, LoginResponseSchema } from '../../../fixtures/api/schemas/toolshop/userSchema';

// Plan: test-plans/toolshop/test-cases/07-backend-checks.md

test.describe('POST /users/login', () => {
  // TC-API-01
  test('TC-API-01 Toolshop API: signing in returns an access token @api', async ({ apiRequest, toolshopCustomer }) => {
    const { status, body } = await apiRequest<LoginResponse>({
      method: 'POST',
      url: ToolshopApi.LOGIN,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: { email: toolshopCustomer.email, password: toolshopCustomer.password },
    });

    expect(status).toBe(200);
    expect(LoginResponseSchema.parse(body)).toBeTruthy();
    expect(body.access_token.length).toBeGreaterThan(0);
    expect(body.expires_in).toBeGreaterThan(0);
  });
});
