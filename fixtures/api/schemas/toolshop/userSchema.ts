import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/**
 * Toolshop user/auth schemas.
 * Source: OpenAPI contract (https://api.practicesoftwaretesting.com/docs?api-docs.json),
 * `TokenResponse` for POST /users/login, checked against a live response on 2026-10-04.
 */

/** POST /users/login → 200 (`TokenResponse`) */
export const LoginResponseSchema = z.strictObject({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

/** POST /users/login request body */
export const LoginRequestSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1),
});

/**
 * `UserResponse` (POST /users/register → 201, GET /users/me → 200).
 * The contract marks no field as required, so fields are optional here; `strictObject` still rejects
 * undocumented fields. Tests assert the fields they rely on explicitly.
 */
export const UserResponseSchema = z.strictObject({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  address: z
    .strictObject({
      street: z.string().optional(),
      house_number: z.string().nullable().optional(),
      city: z.string().optional(),
      state: z.string().nullable().optional(),
      country: z.string().optional(),
      postal_code: z.string().nullable().optional(),
    })
    .optional(),
  phone: z.string().nullable().optional(),
  dob: z.string().optional(),
  email: z.string().optional(),
  id: z.string().optional(),
  provider: z.string().nullable().optional(),
  totp_enabled: z.boolean().optional(),
  enabled: z.boolean().optional(),
  failed_login_attempts: z.number().int().nullable().optional(),
  created_at: z.string().optional(),
});

/** GET /users/logout → 200 (`LogoutResponse`) */
export const LogoutResponseSchema = z.strictObject({
  message: z.string().optional(),
});

export type LoginResponse = zOutput<typeof LoginResponseSchema>;
export type LogoutResponse = zOutput<typeof LogoutResponseSchema>;
export type LoginRequest = zOutput<typeof LoginRequestSchema>;
export type UserResponse = zOutput<typeof UserResponseSchema>;
