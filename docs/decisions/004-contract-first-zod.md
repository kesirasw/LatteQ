# 004. API responses are validated with strict Zod schemas from the OpenAPI contract

- **Status:** Accepted
- **Date:** 2026-10-04
- **Rules it affects:** CLAUDE.md MUST #10 and the Zod WON'T row; skills `api-testing`, `api-test-planning`; hook rules `loose-zod-schema`, `bare-schema-parse`

## Context

Status-code checks alone miss renamed, missing or extra fields. Schemas copied from live responses just encode whatever the API does today.

## Decision

Schemas are `z.strictObject()` built from the site's OpenAPI contract (`api-context/<site>/openapi.json`) and checked as `expect(Schema.parse(body)).toBeTruthy()`. Where the contract is silent, a live-captured schema is allowed but marked `FIXME`.

## Alternatives rejected

- **`z.object()` (loose):** passes when the API adds or leaks fields.
- **Loosening a schema to match a buggy API:** hides defects. Park the test with `FIXME` instead.

## Consequences

Contract drift shows up as test failures and is recorded (KB §13, §15; `docs/DEFECTS.md`).
