// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md

/**
 * Universal invalid values for negative API tests (api-testing skill, Phase 6).
 * Import and iterate with `for...of`; never redefine inline.
 * `.ts` rather than `.json` because JSON can't represent `undefined`; `as const` keeps the values readonly and narrow.
 */

export const INVALID_STRING_VALUES = [123, true, null, undefined] as const;

export const INVALID_NUMBER_VALUES = ['string', '123', true, null, undefined] as const;

export const INVALID_BOOLEAN_VALUES = ['yes', 1, 0, null, undefined] as const;

export const INVALID_ID_VALUES = ['not-an-id', '', 123, null, undefined] as const;

export const INVALID_ENUM_VALUES = ['invalidValue', '', 123, null, undefined] as const;

export const INVALID_ARRAY_VALUES = ['string', 123, null, undefined, {}] as const;

export const INVALID_OBJECT_VALUES = ['string', 123, null, undefined, []] as const;
