/* eslint-disable playwright/no-skipped-test -- FIXME-parked tests (api-testing skill, Phase 7) */
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { newToolshopCustomer } from '../../../data/toolshop-data';
import { ToolshopInvalidData } from '../../../data/toolshop-invalid-data';
import {
  LoginResponse,
  LoginResponseSchema,
  LogoutResponse,
  LogoutResponseSchema,
  UserResponse,
  UserResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/userSchema';
import { UpdateResponse, UpdateResponseSchema } from '../../../fixtures/api/schemas/toolshop/commonSchema';
import {
  ChangePasswordError,
  ChangePasswordErrorSchema,
  DuplicateConflictResponse,
  DuplicateConflictResponseSchema,
  ForbiddenResponse,
  ForbiddenResponseSchema,
  MethodNotAllowedResponse,
  MethodNotAllowedResponseSchema,
  UnauthenticatedResponse,
  UnauthenticatedResponseSchema,
  UnauthorizedResponse,
  UnauthorizedResponseSchema,
  UnprocessableEntityResponse,
  UnprocessableEntityResponseSchema,
  UserAccessError,
  UserAccessErrorSchema,
  ValidationErrorResponse,
  ValidationErrorResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';
import type { ApiRequestFn, ApiRequestParams } from '../../../fixtures/api/api-types';

// Plan: test-plans/toolshop/test-cases/07-backend-checks.md (TC-API-01)
//       test-plans/toolshop/api/test-cases/01-users-and-login.md (API-USR-*)

const api = ENV.TOOLSHOP_API_URL;

/** A date of birth `years` ago, as the API expects it (YYYY-MM-DD). */
const yearsAgo = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

const register = (apiRequest: ApiRequestFn, body: Record<string, unknown>) =>
  apiRequest<UnprocessableEntityResponse>({ method: 'POST', url: ToolshopApi.REGISTER, baseUrl: api, body });

const readProfile = (apiRequest: ApiRequestFn, token?: string) =>
  apiRequest<UserResponse>({ method: 'GET', url: ToolshopApi.CURRENT_USER, baseUrl: api, headers: token });

const login = (apiRequest: ApiRequestFn, body: Record<string, unknown>) =>
  apiRequest<LoginResponse>({ method: 'POST', url: ToolshopApi.LOGIN, baseUrl: api, body });

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

  // API-USR-10
  test('API-USR-10 Toolshop API: logging in with the right details returns a 300-second bearer key @api', async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    const { status, body } = await login(apiRequest, {
      email: toolshopCustomer.email,
      password: toolshopCustomer.password,
    });

    expect(status).toBe(200);
    expect(LoginResponseSchema.parse(body)).toBeTruthy();
    expect(body.token_type.toLowerCase()).toBe('bearer');
    expect(body.expires_in).toBe(300);
  });

  // API-USR-11
  test('API-USR-11 Toolshop API: a wrong password and an unknown email get the same refusal @api', async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    const answers: unknown[] = [];

    for (const [description, email] of [
      ['a wrong password', toolshopCustomer.email],
      ['an unknown email', newToolshopCustomer().email],
    ] as const) {
      await test.step(`Log in with ${description} via POST /users/login`, async () => {
        const { status, body } = await apiRequest<UnauthorizedResponse>({
          method: 'POST',
          url: ToolshopApi.LOGIN,
          baseUrl: api,
          body: { email, password: 'Wrong!Pass123' },
        });

        expect(status).toBe(401);
        expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();
        answers.push(body);
      });
    }

    expect(answers[0]).toEqual(answers[1]);
  });

  // API-USR-12
  for (const [description, pick] of [
    ['nothing at all', () => ({})],
    ['the email address only', (email: string) => ({ email })],
    ['the password only', () => ({ password: 'LatteQ!123a' })],
  ] as const) {
    test(`API-USR-12 Toolshop API: logging in with ${description} is refused @api`, async ({
      apiRequest,
      toolshopCustomer,
    }) => {
      const { status, body } = await apiRequest<UnauthorizedResponse>({
        method: 'POST',
        url: ToolshopApi.LOGIN,
        baseUrl: api,
        body: pick(toolshopCustomer.email),
      });

      expect(status).toBe(401);
      expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();
      expect(body.error).toMatch(/invalid login request/i);
    });
  }
});

test.describe('POST /users/register', () => {
  // API-USR-01
  test('API-USR-01 Toolshop API: registering a new customer returns their details @api', async ({ apiRequest }) => {
    const customer = newToolshopCustomer();

    const { status, body } = await apiRequest<UserResponse>({
      method: 'POST',
      url: ToolshopApi.REGISTER,
      baseUrl: api,
      body: customer,
    });

    expect(status).toBe(201);
    expect(UserResponseSchema.parse(body)).toBeTruthy();
    expect(body.id).toBeTruthy();
    expect(body).toMatchObject({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      dob: customer.dob,
      phone: customer.phone,
      address: customer.address,
    });
    expect(body).not.toHaveProperty('password');
  });

  // API-USR-02
  test('API-USR-02 Toolshop API: registering an email address already in use is refused @api', async ({
    apiRequest,
  }) => {
    const customer = newToolshopCustomer();

    await test.step('Register a customer via POST /users/register', async () => {
      const { status } = await register(apiRequest, customer);
      expect(status).toBe(201);
    });

    await test.step('Register the same customer again via POST /users/register', async () => {
      const { status, body } = await apiRequest<DuplicateConflictResponse>({
        method: 'POST',
        url: ToolshopApi.REGISTER,
        baseUrl: api,
        body: customer,
      });

      expect(status).toBe(409);
      expect(DuplicateConflictResponseSchema.parse(body)).toBeTruthy();
      expect(JSON.stringify(body)).toMatch(/already exists/);
    });
  });

  // API-USR-03 — the contract documents 400; the API consistently answers 422 for validation (finding 10)
  test('API-USR-03 Toolshop API: registering with an empty request names every required detail @api', async ({
    apiRequest,
  }) => {
    const { status, body } = await register(apiRequest, {});

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body).sort()).toEqual(['email', 'first_name', 'last_name', 'password']);
  });

  // API-USR-04 — 422, not the documented 400 (finding 10)
  for (const field of ['first_name', 'last_name', 'email', 'password'] as const) {
    test(`API-USR-04 Toolshop API: registering without ${field} is refused @api`, async ({ apiRequest }) => {
      const { [field]: _omitted, ...withoutField } = newToolshopCustomer();

      const { status, body } = await register(apiRequest, withoutField);

      expect(status).toBe(422);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      expect(Object.keys(body)).toEqual([field]);
    });
  }

  // API-USR-05
  for (const [field, value] of [
    ['first_name', 123],
    ['last_name', true],
    ['email', 123],
    ['password', 12345678],
  ] as const) {
    test(`API-USR-05 Toolshop API: registering with ${field} = ${JSON.stringify(value)} is refused @api`, async ({
      apiRequest,
    }) => {
      const { status, body } = await register(apiRequest, { ...newToolshopCustomer(), [field]: value });

      expect(status).toBe(422);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      expect(body[field]?.join(' ')).toMatch(/must be a string/);
    });
  }

  // API-USR-06
  for (const [field, length] of [
    ['first_name', 41],
    ['last_name', 21],
  ] as const) {
    test(`API-USR-06 Toolshop API: registering with a ${length}-character ${field} is refused @api`, async ({
      apiRequest,
    }) => {
      const { status, body } = await register(apiRequest, { ...newToolshopCustomer(), [field]: 'x'.repeat(length) });

      expect(status).toBe(422);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      expect(body[field]?.join(' ')).toMatch(/must not be greater than/);
    });
  }

  // API-USR-07
  for (const { rule, value } of ToolshopInvalidData.weakPasswords) {
    test(`API-USR-07 Toolshop API: a password without ${rule} is refused @api`, async ({ apiRequest }) => {
      const { status, body } = await register(apiRequest, { ...newToolshopCustomer(), password: value });

      expect(status).toBe(422);
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
      expect(Object.keys(body)).toEqual(['password']);
    });
  }

  // API-USR-08
  test('API-USR-08 Toolshop API: registering someone 10 years old is refused @api', async ({ apiRequest }) => {
    const { status, body } = await register(apiRequest, { ...newToolshopCustomer(), dob: yearsAgo(10) });

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body)).toEqual(['dob']);
  });

  // API-USR-08
  // FIXME: an 80-year-old is registered (201); the contract says the date of birth must be 18 to 75 years ago
  // (API test plan, finding 13; seen 2026-10-06)
  test.skip('API-USR-08 Toolshop API: registering someone 80 years old is refused @api', async ({ apiRequest }) => {
    const { status, body } = await register(apiRequest, { ...newToolshopCustomer(), dob: yearsAgo(80) });

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body)).toEqual(['dob']);
  });

  // API-USR-09
  // FIXME: the API accepts an address with no @ and creates the account (201); the contract requires an email format
  // (API test plan, finding 13; seen 2026-10-06)
  test.skip('API-USR-09 Toolshop API: registering with a badly formed email address is refused @api', async ({
    apiRequest,
  }) => {
    const customer = newToolshopCustomer();
    // Unique per run: while the bug exists, a fixed bad address would be taken after one run and answer 409 instead
    const { status, body } = await register(apiRequest, { ...customer, email: customer.email.replace('@', '.at.') });

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body)).toEqual(['email']);
  });
});

test.describe('GET /users/me', () => {
  // API-USR-13
  test('API-USR-13 Toolshop API: a customer reads their own profile @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await readProfile(apiRequest, me.token);

    expect(status).toBe(200);
    expect(UserResponseSchema.parse(body)).toBeTruthy();
    expect(body).toMatchObject({
      id: me.customer.id,
      email: me.customer.email,
      first_name: me.customer.firstName,
      last_name: me.customer.lastName,
    });
  });
});

test.describe('GET /users/refresh', () => {
  // API-USR-14
  test('API-USR-14 Toolshop API: a renewed access key works and the old one stops working @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    let renewed = '';

    await test.step('Renew the access key via GET /users/refresh', async () => {
      const { status, body } = await apiRequest<LoginResponse>({
        method: 'GET',
        url: ToolshopApi.REFRESH,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(200);
      expect(LoginResponseSchema.parse(body)).toBeTruthy();
      expect(body.access_token).not.toBe(me.token);
      renewed = body.access_token;
    });

    await test.step('Read the profile with the new key via GET /users/me', async () => {
      const { status, body } = await readProfile(apiRequest, renewed);
      expect(status).toBe(200);
      expect(UserResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('Read the profile with the old key via GET /users/me', async () => {
      const { status, body } = await apiRequest<UnauthenticatedResponse>({
        method: 'GET',
        url: ToolshopApi.CURRENT_USER,
        baseUrl: api,
        headers: me.token,
      });
      expect(status).toBe(401);
      expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
    });
  });

  // API-USR-34
  // FIXME: GET /users/refresh without an access key answers 500 "Server Error" instead of the documented 401
  // (API test plan, finding 6; seen 2026-10-06)
  test.skip('API-USR-34 Toolshop API: renewing the access key without one is refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<UnauthenticatedResponse>({
      method: 'GET',
      url: ToolshopApi.REFRESH,
      baseUrl: api,
    });

    expect(status).toBe(401);
    expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('GET /users/logout', () => {
  // API-USR-15
  test('API-USR-15 Toolshop API: logging out ends the session @api', async ({ apiRequest, newToolshopSession }) => {
    const me = await newToolshopSession();

    await test.step('Log out via GET /users/logout', async () => {
      const { status, body } = await apiRequest<LogoutResponse>({
        method: 'GET',
        url: ToolshopApi.LOGOUT,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(200);
      expect(LogoutResponseSchema.parse(body)).toBeTruthy();
      expect(body.message).toMatch(/logged out/i);
    });

    await test.step('Read the profile with the same key via GET /users/me', async () => {
      const { status, body } = await apiRequest<UnauthenticatedResponse>({
        method: 'GET',
        url: ToolshopApi.CURRENT_USER,
        baseUrl: api,
        headers: me.token,
      });
      expect(status).toBe(401);
      expect(UnauthenticatedResponseSchema.parse(body)).toBeTruthy();
    });
  });
});

test.describe('POST /users/change-password', () => {
  // API-USR-16
  test('API-USR-16 Toolshop API: after a password change only the new password works @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const newPassword = `${me.customer.password}New`;

    await test.step('Change the password via POST /users/change-password', async () => {
      const { status, body } = await apiRequest<UpdateResponse>({
        method: 'POST',
        url: ToolshopApi.CHANGE_PASSWORD,
        baseUrl: api,
        headers: me.token,
        body: {
          current_password: me.customer.password,
          new_password: newPassword,
          new_password_confirmation: newPassword,
        },
      });

      expect(status).toBe(200);
      expect(UpdateResponseSchema.parse(body)).toBeTruthy();
      expect(body.success).toBe(true);
    });

    await test.step('Log in with the old password via POST /users/login', async () => {
      const { status, body } = await apiRequest<UnauthorizedResponse>({
        method: 'POST',
        url: ToolshopApi.LOGIN,
        baseUrl: api,
        body: { email: me.customer.email, password: me.customer.password },
      });
      expect(status).toBe(401);
      expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('Log in with the new password via POST /users/login', async () => {
      const { status, body } = await login(apiRequest, { email: me.customer.email, password: newPassword });
      expect(status).toBe(200);
      expect(LoginResponseSchema.parse(body)).toBeTruthy();
    });
  });

  // API-USR-17 — 400 isn't documented for this operation (finding 17)
  test('API-USR-17 Toolshop API: a wrong current password is refused and the old password still works @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    await test.step('Change the password with a wrong current one via POST /users/change-password', async () => {
      const { status, body } = await apiRequest<ChangePasswordError>({
        method: 'POST',
        url: ToolshopApi.CHANGE_PASSWORD,
        baseUrl: api,
        headers: me.token,
        body: {
          current_password: 'Wrong!Pass123',
          new_password: 'LatteQ!New123',
          new_password_confirmation: 'LatteQ!New123',
        },
      });

      expect(status).toBe(400);
      expect(ChangePasswordErrorSchema.parse(body)).toBeTruthy();
      expect(body.success).toBe(false);
    });

    await test.step('Log in with the unchanged password via POST /users/login', async () => {
      const { status, body } = await login(apiRequest, { email: me.customer.email, password: me.customer.password });
      expect(status).toBe(200);
      expect(LoginResponseSchema.parse(body)).toBeTruthy();
    });
  });

  // API-USR-18
  test('API-USR-18 Toolshop API: a mismatched password confirmation is refused @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: ToolshopApi.CHANGE_PASSWORD,
      baseUrl: api,
      headers: me.token,
      body: {
        current_password: me.customer.password,
        new_password: 'LatteQ!New123',
        new_password_confirmation: 'LatteQ!Other123',
      },
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors)).toEqual(['new_password']);
  });
});

test.describe('POST /users/forgot-password', () => {
  // API-USR-19
  test('API-USR-19 Toolshop API: a password reset for a registered email is accepted @api', async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    const { status, body } = await apiRequest<UpdateResponse>({
      method: 'POST',
      url: ToolshopApi.FORGOT_PASSWORD,
      baseUrl: api,
      body: { email: toolshopCustomer.email },
    });

    expect(status).toBe(200);
    expect(UpdateResponseSchema.parse(body)).toBeTruthy();
    expect(body.success).toBe(true);
  });

  // API-USR-20 — 422, not the documented 400 (finding 10)
  test('API-USR-20 Toolshop API: a password reset for an unknown email is refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: ToolshopApi.FORGOT_PASSWORD,
      baseUrl: api,
      body: { email: newToolshopCustomer().email },
    });

    expect(status).toBe(422);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors)).toEqual(['email']);
  });

  // API-USR-21
  // FIXME: a password reset without an email answers 404 "Requested item not found" instead of the documented 400
  // (API test plan, finding 9; seen 2026-10-06)
  test.skip('API-USR-21 Toolshop API: a password reset without an email is refused @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<ValidationErrorResponse>({
      method: 'POST',
      url: ToolshopApi.FORGOT_PASSWORD,
      baseUrl: api,
      body: {},
    });

    // 400 is documented; 422 is how this API reports every other validation error (finding 10)
    expect([400, 422]).toContain(status);
    expect(ValidationErrorResponseSchema.parse(body)).toBeTruthy();
    expect(Object.keys(body.errors)).toEqual(['email']);
  });
});

test.describe('GET /users/{userId}', () => {
  // API-USR-22
  test('API-USR-22 Toolshop API: a customer reads their own user record @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<UserResponse>({
      method: 'GET',
      url: `${ToolshopApi.USERS}/${me.customer.id}`,
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(200);
    expect(UserResponseSchema.parse(body)).toBeTruthy();
    expect(body).toMatchObject({ id: me.customer.id, email: me.customer.email });
  });

  // API-USR-23
  test("API-USR-23 Toolshop API: a customer can't read another customer's record @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const other = await newToolshopSession();

    const { status, body } = await apiRequest<UserAccessError>({
      method: 'GET',
      url: `${ToolshopApi.USERS}/${other.customer.id}`,
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(404);
    expect(UserAccessErrorSchema.parse(body)).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain(other.customer.email);
  });

  // API-USR-24
  test("API-USR-24 Toolshop API: users that don't exist or have badly formed IDs are not found @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    for (const { description, value } of [
      { description: "a well-formed ID that doesn't exist", value: ToolshopInvalidData.unknownId },
      ...ToolshopInvalidData.malformedIds,
    ]) {
      await test.step(`Read a user with ${description} via GET /users/{userId}`, async () => {
        const { status, body } = await apiRequest<UserAccessError>({
          method: 'GET',
          url: `${ToolshopApi.USERS}/${encodeURIComponent(value)}`,
          baseUrl: api,
          headers: me.token,
        });

        expect(status).toBe(404);
        expect(UserAccessErrorSchema.parse(body)).toBeTruthy();
      });
    }
  });
});

test.describe('PATCH and PUT /users/{userId}', () => {
  // API-USR-25
  test('API-USR-25 Toolshop API: a customer changes their phone number @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const newPhone = '0699999999';

    await test.step('Change the phone number via PATCH /users/{userId}', async () => {
      const { status, body } = await apiRequest<UpdateResponse>({
        method: 'PATCH',
        url: `${ToolshopApi.USERS}/${me.customer.id}`,
        baseUrl: api,
        headers: me.token,
        body: { phone: newPhone },
      });

      expect(status).toBe(200);
      expect(UpdateResponseSchema.parse(body)).toBeTruthy();
      expect(body.success).toBe(true);
    });

    await test.step('Read the profile via GET /users/me', async () => {
      const { status, body } = await readProfile(apiRequest, me.token);
      expect(status).toBe(200);
      expect(UserResponseSchema.parse(body)).toBeTruthy();
      expect(body).toMatchObject({ phone: newPhone, first_name: me.customer.firstName, email: me.customer.email });
    });
  });

  // API-USR-26
  test('API-USR-26 Toolshop API: a customer replaces their details @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const newFirstName = 'Replaced';

    await test.step('Replace the details via PUT /users/{userId}', async () => {
      const { status, body } = await apiRequest<UpdateResponse>({
        method: 'PUT',
        url: `${ToolshopApi.USERS}/${me.customer.id}`,
        baseUrl: api,
        headers: me.token,
        body: { ...me.customer.data, first_name: newFirstName },
      });

      expect(status).toBe(200);
      expect(UpdateResponseSchema.parse(body)).toBeTruthy();
      expect(body.success).toBe(true);
    });

    await test.step('Read the profile via GET /users/me', async () => {
      const { status, body } = await readProfile(apiRequest, me.token);
      expect(status).toBe(200);
      expect(UserResponseSchema.parse(body)).toBeTruthy();
      expect(body.first_name).toBe(newFirstName);
    });
  });

  // API-USR-27
  test('API-USR-27 Toolshop API: changing details to invalid values is refused and changes nothing @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    for (const { description, method, change, field } of [
      {
        description: 'a 41-character first name',
        method: 'PATCH',
        change: { first_name: 'x'.repeat(41) },
        field: 'first_name',
      },
      { description: 'a 10-year-old date of birth', method: 'PATCH', change: { dob: yearsAgo(10) }, field: 'dob' },
      {
        description: 'a first name that is a number',
        method: 'PATCH',
        change: { first_name: 123 },
        field: 'first_name',
      },
      { description: 'no details at all', method: 'PUT', change: {}, field: 'first_name' },
    ] as const) {
      await test.step(`Send ${description} via ${method} /users/{userId}`, async () => {
        const { status, body } = await apiRequest<UnprocessableEntityResponse>({
          method,
          url: `${ToolshopApi.USERS}/${me.customer.id}`,
          baseUrl: api,
          headers: me.token,
          body: change,
        });

        expect(status).toBe(422);
        expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
        expect(Object.keys(body)).toContain(field);
      });
    }

    await test.step('Read the unchanged profile via GET /users/me', async () => {
      const { status, body } = await readProfile(apiRequest, me.token);
      expect(status).toBe(200);
      expect(UserResponseSchema.parse(body)).toBeTruthy();
      expect(body).toMatchObject({ first_name: me.customer.firstName, dob: me.customer.data.dob });
    });
  });

  // API-USR-28
  test("API-USR-28 Toolshop API: a customer can't change another customer's details @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const other = await newToolshopSession();

    for (const [method, change] of [
      ['PUT', { ...other.customer.data, first_name: 'Hijacked' }],
      ['PATCH', { phone: '0600000000' }],
    ] as const) {
      await test.step(`Change the other customer via ${method} /users/{userId}`, async () => {
        const { status, body } = await apiRequest<UserAccessError>({
          method,
          url: `${ToolshopApi.USERS}/${other.customer.id}`,
          baseUrl: api,
          headers: me.token,
          body: change,
        });

        expect(status).toBe(403);
        expect(UserAccessErrorSchema.parse(body)).toBeTruthy();
      });
    }

    await test.step("Read the other customer's unchanged profile via GET /users/me", async () => {
      const { status, body } = await readProfile(apiRequest, other.token);
      expect(status).toBe(200);
      expect(UserResponseSchema.parse(body)).toBeTruthy();
      expect(body).toMatchObject({ first_name: other.customer.firstName, phone: other.customer.data.phone });
    });
  });

  // API-USR-29
  // FIXME: answers 403 with the raw SQL error (database name, host, statement) instead of the documented 409
  // (API test plan, finding 5; seen 2026-10-06)
  test.skip('API-USR-29 Toolshop API: changing my email to one another customer uses is refused @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const other = await newToolshopSession();

    const { status, body } = await apiRequest<DuplicateConflictResponse>({
      method: 'PUT',
      url: `${ToolshopApi.USERS}/${me.customer.id}`,
      baseUrl: api,
      headers: me.token,
      body: { ...me.customer.data, email: other.customer.email },
    });

    expect(status).toBe(409);
    expect(DuplicateConflictResponseSchema.parse(body)).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/SQLSTATE|mysql/i);
  });
});

test.describe('Admin-only user operations, as a customer', () => {
  // API-USR-30
  test("API-USR-30 Toolshop API: a customer can't delete another account @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();
    const other = await newToolshopSession();

    await test.step('Delete the other customer via DELETE /users/{userId}', async () => {
      const { status, body } = await apiRequest<ForbiddenResponse>({
        method: 'DELETE',
        url: `${ToolshopApi.USERS}/${other.customer.id}`,
        baseUrl: api,
        headers: me.token,
      });

      expect(status).toBe(403);
      expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
    });

    await test.step('The other customer logs in via POST /users/login', async () => {
      const { status, body } = await login(apiRequest, {
        email: other.customer.email,
        password: other.customer.password,
      });
      expect(status).toBe(200);
      expect(LoginResponseSchema.parse(body)).toBeTruthy();
    });
  });

  // API-USR-31 — 403 isn't documented for GET /users (finding 12)
  test("API-USR-31 Toolshop API: a customer can't list all users @api", async ({ apiRequest, newToolshopSession }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<ForbiddenResponse>({
      method: 'GET',
      url: ToolshopApi.USERS,
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(403);
    expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
  });

  // API-USR-32
  // FIXME: every logged-in customer's search returns other customers' full records (email, phone, address);
  // it should be 403 like GET /users (API test plan, finding 1; seen 2026-10-06)
  test.skip("API-USR-32 Toolshop API: a customer can't search other customers' details @api", async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    const { status, body } = await apiRequest<ForbiddenResponse>({
      method: 'GET',
      url: `${ToolshopApi.USER_SEARCH}?q=Jane`,
      baseUrl: api,
      headers: me.token,
    });

    expect(status).toBe(403);
    expect(ForbiddenResponseSchema.parse(body)).toBeTruthy();
  });
});

test.describe('Protected user operations without a valid access key', () => {
  // API-USR-33
  test('API-USR-33 Toolshop API: account operations refuse a missing or invalid access key @api', async ({
    apiRequest,
    toolshopCustomer,
  }) => {
    const userUrl = `${ToolshopApi.USERS}/${toolshopCustomer.id}`;
    const operations: Omit<ApiRequestParams, 'baseUrl' | 'headers'>[] = [
      { method: 'GET', url: ToolshopApi.CURRENT_USER },
      { method: 'GET', url: ToolshopApi.LOGOUT },
      {
        method: 'POST',
        url: ToolshopApi.CHANGE_PASSWORD,
        body: {
          current_password: toolshopCustomer.password,
          new_password: 'LatteQ!New123',
          new_password_confirmation: 'LatteQ!New123',
        },
      },
      { method: 'GET', url: userUrl },
      { method: 'PUT', url: userUrl, body: toolshopCustomer.data },
      { method: 'PATCH', url: userUrl, body: { phone: '0600000000' } },
      { method: 'DELETE', url: userUrl },
      { method: 'GET', url: ToolshopApi.USERS },
      { method: 'GET', url: `${ToolshopApi.USER_SEARCH}?q=Latte` },
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

test.describe('Unsupported methods on user addresses', () => {
  // API-USR-35 — 405 is documented on /users/{userId}; the other two were seen live
  test('API-USR-35 Toolshop API: unsupported methods on user addresses are refused @api', async ({
    apiRequest,
    newToolshopSession,
  }) => {
    const me = await newToolshopSession();

    for (const [method, url] of [
      ['POST', `${ToolshopApi.USERS}/${me.customer.id}`],
      ['POST', ToolshopApi.CURRENT_USER],
      ['DELETE', ToolshopApi.USERS],
    ] as const) {
      await test.step(`${method} ${url}`, async () => {
        const { status, body } = await apiRequest<MethodNotAllowedResponse>({
          method,
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
