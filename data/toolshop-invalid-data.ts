/**
 * Site-specific invalid values for Toolshop API negative tests (api-testing skill, Phase 6, tier 2).
 * Universal type mismatches live in data/invalid-values.ts. Plan: test-plans/toolshop/api/.
 */

export const ToolshopInvalidData = {
  /** Well-formed (26-character ULID) but not a real record: "something that doesn't exist" */
  unknownId: '01AAAAAAAAAAAAAAAAAAAAAAAA',
  /** An invoice number in the right format that nobody has */
  unknownInvoiceNumber: 'INV-0000000000',
  /** An access key the service never issued */
  invalidToken: 'invalid.access.key',
  /** Path-parameter fuzzing ("badly formed IDs"); sent URL-encoded */
  malformedIds: [
    { description: 'text', value: 'abc' },
    { description: 'a number', value: '123' },
    { description: 'a yes/no word', value: 'true' },
    { description: 'a database injection attempt', value: "' OR 1=1--" },
    { description: 'a script tag', value: '<script>' },
  ],
  badlyFormedEmail: 'not-an-email',
  /** Each password breaks exactly one documented rule (UserRequest.password: 8+ chars, upper, lower, number, symbol) */
  weakPasswords: [
    { rule: 'at least 8 characters', value: 'Ab1!xyz' },
    { rule: 'a capital letter', value: 'latteq!123' },
    { rule: 'a small letter', value: 'LATTEQ!123' },
    { rule: 'a number', value: 'LatteQ!abc' },
    { rule: 'a symbol', value: 'LatteQ1234' },
  ],
  /** Payment methods outside the contract's enum */
  unknownPaymentMethods: ['bitcoin', 123],
} as const;
