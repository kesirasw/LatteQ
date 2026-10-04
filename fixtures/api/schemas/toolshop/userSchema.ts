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

export type LoginResponse = zOutput<typeof LoginResponseSchema>;
export type LoginRequest = zOutput<typeof LoginRequestSchema>;
