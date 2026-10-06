# API testing — troubleshooting

Adapted from agentic-playwright (MIT).

## `expect(Schema.parse(body)).toBeTruthy()` throws `ZodError`

**Cause:** the response disagrees with the schema (extra, missing or wrongly-typed field).
- **Schema built from the contract:** this is a contract violation. Keep the schema, mark the test per Phase 7 (`test.skip` + `// FIXME:`), and report it. Don't loosen the schema.
- **Schema captured live** (marked `FIXME` in the schema file): re-check the live response and update the schema and its FIXME note. Never fall back to `z.any()` or `z.object()`.

## 401 with a null body

**Cause:** some APIs return no body for 401/403.
**Fix:** `expect(body).toBeNull()` instead of parsing. Toolshop does return a body (`{"error":"Unauthorized"}`).

## 401 in the middle of a test that was passing

**Cause:** an expired token. Toolshop tokens last **300 seconds**.
**Fix:** get the token inside the test (or per test via a helper fixture), not once at the start of the run.

## Status code differs from the contract

**Fix:** Phase 7: keep the contract's expectation, `test.skip` with `/* eslint-disable playwright/no-skipped-test */` and `// FIXME: <what and when>`. Never adjust the expected status to the bug.

## Only an empty-body test exists

**Fix:** add per-field omission and per-field wrong-type loops (`negative-testing.md`).

## Tests interfere with each other on a shared demo

**Cause:** server-side state per user (the Toolshop cart is per customer).
**Fix:** one account per parallel worker, or create the data the test needs, and always clean up in `afterEach`.

## The write-time hook blocks my edit

- `loose-zod-schema`: use `z.strictObject()` in `fixtures/api/schemas/`.
- `bare-schema-parse`: wrap as `expect(Schema.parse(body)).toBeTruthy()`.
- `hardcoded-url`: use `ENV.<SITE>_API_URL` + `<Site>Api.*`.

## A run goes red and the cause isn't obvious

Load the `debugging` skill. For a confirmed contract violation, come back here (Phase 7).
