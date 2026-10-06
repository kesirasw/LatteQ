import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/** `UpdateResponse` in the contract: PUT/PATCH on users and invoices, change/forgot password → 200 {"success":true} */
export const UpdateResponseSchema = z.strictObject({
  success: z.boolean().optional(),
});

export type UpdateResponse = zOutput<typeof UpdateResponseSchema>;
