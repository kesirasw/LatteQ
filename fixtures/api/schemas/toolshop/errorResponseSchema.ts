// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md
import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/*
 * Error-response schemas for the Toolshop API (api.practicesoftwaretesting.com).
 *
 * The contract documents bodies only for UnauthorizedResponse, ItemNotFoundResponse, ResourceNotFoundResponse,
 * MethodNotAllowedResponse and DuplicateConflictResponse. Every other shape below is marked FIXME: captured from a
 * live response (skill Phase 1 fallback). Re-check whenever the contract adds error schemas
 * (API test plan, findings 17 and 18).
 */

/**
 * 401 Unauthorized from the login endpoint, which uses `error` where every other endpoint uses `message`.
 * FIXME: not in contract. Live: {"error":"Unauthorized"} (wrong password) and {"error":"Invalid login request"}
 * (details missing), 2026-10-06.
 */
export const UnauthorizedResponseSchema = z.strictObject({
  error: z.string(),
});

/** 401 from protected endpoints (`UnauthorizedResponse` in the contract): {"message":"Unauthorized"} */
export const UnauthenticatedResponseSchema = z.strictObject({
  message: z.string(),
});

/** 404 (`ItemNotFoundResponse` / `ResourceNotFoundResponse` in the contract): {"message":"Requested item not found"} */
export const NotFoundResponseSchema = z.strictObject({
  message: z.string(),
});

/** 405 (`MethodNotAllowedResponse` in the contract): {"message":"Method is not allowed for the requested route"} */
export const MethodNotAllowedResponseSchema = z.strictObject({
  message: z.string(),
});

/** 403 Forbidden. FIXME: the contract has no body for 403. Live: {"message":"Forbidden"} (GET /users as a customer, 2026-10-06). */
export const ForbiddenResponseSchema = z.strictObject({
  message: z.string(),
});

/**
 * Ownership refusals on /users/{userId}: 404 "You are not authorized to view this user." and
 * 403 "You can only update your own data.".
 * FIXME: not in contract; captured live 2026-10-06.
 */
export const UserAccessErrorSchema = z.strictObject({
  error: z.string(),
});

/**
 * 422 from users, products and invoices: a map of field name → validation messages.
 * FIXME: not in contract (`UnprocessableEntityResponse` has no body). Live:
 * {"billing_country":["The billing_country does not match the entered address. ..."]} (POST /invoices, 2026-10-04).
 */
export const UnprocessableEntityResponseSchema = z.record(z.string(), z.array(z.string()));

/**
 * 422 from carts, payment check, guest invoices and password endpoints: a summary message plus the field map.
 * FIXME: not in contract. Live: {"message":"The quantity field is required.","errors":{"quantity":[...]}}
 * (POST /carts/{id}, 2026-10-06).
 */
export const ValidationErrorResponseSchema = z.strictObject({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())),
});

/** 409 (`DuplicateConflictResponse` in the contract): either a field-level message map or a single message */
export const DuplicateConflictResponseSchema = z.union([
  z.record(z.string(), z.array(z.string())),
  z.strictObject({ message: z.string() }),
]);

/**
 * 400 from POST /users/change-password with a wrong current password.
 * FIXME: not in contract. Live: {"success":false,"message":"Your current password does not matches with the password."}
 * (2026-10-06).
 */
export const ChangePasswordErrorSchema = z.strictObject({
  success: z.boolean(),
  message: z.string(),
});

export type UnauthorizedResponse = zOutput<typeof UnauthorizedResponseSchema>;
export type UnauthenticatedResponse = zOutput<typeof UnauthenticatedResponseSchema>;
export type NotFoundResponse = zOutput<typeof NotFoundResponseSchema>;
export type MethodNotAllowedResponse = zOutput<typeof MethodNotAllowedResponseSchema>;
export type ForbiddenResponse = zOutput<typeof ForbiddenResponseSchema>;
export type UserAccessError = zOutput<typeof UserAccessErrorSchema>;
export type UnprocessableEntityResponse = zOutput<typeof UnprocessableEntityResponseSchema>;
export type ValidationErrorResponse = zOutput<typeof ValidationErrorResponseSchema>;
export type DuplicateConflictResponse = zOutput<typeof DuplicateConflictResponseSchema>;
export type ChangePasswordError = zOutput<typeof ChangePasswordErrorSchema>;
