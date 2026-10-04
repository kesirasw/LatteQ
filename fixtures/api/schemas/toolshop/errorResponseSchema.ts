// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md
import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/*
 * Error-response schemas for the Toolshop API (api.practicesoftwaretesting.com).
 *
 * FIXME: the OpenAPI contract lists these status codes but not their body schemas, so the
 * shapes below are captured from live responses (skill Phase 1 fallback). Re-check whenever
 * the contract adds error schemas.
 */

/**
 * 401 Unauthorized from the login endpoint.
 * Live: {"error":"Unauthorized"} (POST /users/login with a wrong password, 2026-10-04).
 */
export const UnauthorizedResponseSchema = z.strictObject({
  error: z.string(),
});

/**
 * 401 Unauthorized from protected endpoints (missing, invalid or expired token). A different shape from login's.
 * Live: {"message":"Unauthorized"} (POST /invoices without a token / with an invalid token, 2026-10-04).
 */
export const UnauthenticatedResponseSchema = z.strictObject({
  message: z.string(),
});

/**
 * 404 Not Found.
 * Live (per agentic-playwright): {"message":"Requested item not found"}. Not yet seen in LatteQ.
 */
export const NotFoundResponseSchema = z.strictObject({
  message: z.string(),
});

/**
 * 422 Unprocessable Entity: a map of field name → validation messages.
 * Live: {"billing_country":["The billing_country does not match the entered address. ..."]}
 * (POST /invoices, 2026-10-04).
 */
export const UnprocessableEntityResponseSchema = z.record(z.string(), z.array(z.string()));

export type UnauthorizedResponse = zOutput<typeof UnauthorizedResponseSchema>;
export type UnauthenticatedResponse = zOutput<typeof UnauthenticatedResponseSchema>;
export type NotFoundResponse = zOutput<typeof NotFoundResponseSchema>;
export type UnprocessableEntityResponse = zOutput<typeof UnprocessableEntityResponseSchema>;
