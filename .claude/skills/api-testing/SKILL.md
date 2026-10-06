---
name: api-testing
description: API testing for LatteQ with Playwright — contract-first (OpenAPI) schemas, the apiRequest fixture from fixtures/test.ts, Zod 4 response validation with expect(Schema.parse(body)).toBeTruthy(), test.step per call in multi-call tests, the status-code coverage matrix, per-field negative testing with data/invalid-values.ts, path-parameter fuzzing, handling contract mismatches with a FIXME skip, and when to promote setup to a helper fixture. Use when writing or updating API specs under tests/api/, adding tests for an endpoint, creating Zod schemas in fixtures/api/schemas/, automating a test plan's "backend checks", or investigating an API behaviour mismatch. Not for UI locators (selectors / page-objects) or generic fixture work (fixtures).
author: Adapted for LatteQ from agentic-playwright by Ivan Davidov (MIT)
---

# API Testing

## Critical

- **Contract first.** Schemas and expected status codes come from the site's OpenAPI/Swagger contract. Don't call the endpoint to "see what it returns" and copy that. Only when the contract is missing something (e.g. error bodies) may a live response fill the gap, marked with a `FIXME` comment saying so.
- **Validate every response body with Zod, wrapped:** `expect(SchemaName.parse(body)).toBeTruthy();`. A type generic alone isn't enough, and a bare `Schema.parse(body)` isn't either (the write-time hook blocks it).
- **Schemas use `z.strictObject()`**, never `z.object()`, so unexpected fields fail (also blocked by the hook).
- **No literal URLs, tokens, credentials or paths.** Base URL from `ENV.<SITE>_API_URL`, paths from `data/api-endpoints.ts`, credentials from `ENV` (`process.env`), tokens from a login call made by the test.
- **One `test.step()` per API call** when a test makes more than one call.
- **Never drop or bend a test because the API misbehaves.** Write it as the contract says, mark it `test.skip` with a `// FIXME:` comment explaining the mismatch (Phase 7). Never change the expected status to match a bug.
- **Empty-body validation is never enough.** Every request-body endpoint needs per-field omission and per-field invalid-type tests; every path parameter gets the fuzzing loop.
- **Use the `apiRequest` fixture directly.** Promote to a helper fixture only when the same setup/teardown appears in 3+ spec files.
- **Automate only an approved plan.** If the specs automate cases from `test-plans/<site>/api/`, check the plan's Status first. Not **Approved** → stop and ask the user to review the plan (`api-test-planning`).

## Where things live

```
fixtures/
  test.ts                         ← the only test/expect import; includes apiRequest (mergeTests)
  api/
    api-request-fixture.ts        ← provides apiRequest to tests
    plain-function.ts             ← core HTTP call (used by the fixture and helper fixtures)
    api-types.ts                  ← ApiRequestParams, ApiRequestResponse<T>
    schemas/<site>/               ← Zod schemas per site: <resource>Schema.ts, errorResponseSchema.ts
data/
  env.ts                          ← ENV.<SITE>_API_URL, credentials from process.env
  api-endpoints.ts                ← <Site>Api.* endpoint paths (from the contract)
  invalid-values.ts               ← INVALID_* universal negative-test values
tests/
  api/<site>/<resource>.spec.ts   ← API specs, one file per resource (users, invoices, products…)
```

`<site>` is the same name used in `ui-context/<site>/` and `test-plans/<site>/` (e.g. `toolshop`).

## Phase 1 — Source the contract

1. Find the site's OpenAPI document (Toolshop: `https://api.practicesoftwaretesting.com/docs?api-docs.json`; human view `/api/documentation`). Record its URL in the site's `ui-context/<site>/MAP.md`.
2. For the endpoint: read the path, method, request body (required/optional fields, types), every documented response code, and the response schemas.
3. Add the path to `data/api-endpoints.ts` if it isn't there.
4. **Contract gaps** (e.g. Toolshop lists 401/404/422 but not their bodies): capture one live response, write the schema from it, and leave a `FIXME` comment on the schema saying it was captured live and when.
5. **No contract at all:** explore with live requests, treat the result as a provisional contract, and tell the user that documentation is missing.

## Phase 2 — Schema and type

```ts
// fixtures/api/schemas/toolshop/userSchema.ts
import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

/** POST /users/login → 200 (`TokenResponse` in the contract) */
export const LoginResponseSchema = z.strictObject({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export type LoginResponse = zOutput<typeof LoginResponseSchema>;
```

- Mirror the contract field by field, including any response envelope. Don't build schema factories. Extract a shared piece only once it really repeats.
- Use the contract's types (`number` stays `z.number()`, even if live values are integers).
- Error bodies go in `schemas/<site>/errorResponseSchema.ts` (Toolshop has `UnauthorizedResponseSchema`, `NotFoundResponseSchema` and `UnprocessableEntityResponseSchema`).
- A response with no body (e.g. some 204/401s): assert `expect(body).toBeNull()` instead of parsing.

## Phase 3 — Write the test with `apiRequest`

```ts
// tests/api/toolshop/users.spec.ts
import { test, expect } from '../../../fixtures/test';
import { ENV } from '../../../data/env';
import { ToolshopApi } from '../../../data/api-endpoints';
import { LoginResponse, LoginResponseSchema } from '../../../fixtures/api/schemas/toolshop/userSchema';

test.describe('POST /users/login', () => {
  test.skip(!ENV.TOOLSHOP_EMAIL || !ENV.TOOLSHOP_PASSWORD, 'TOOLSHOP_EMAIL / TOOLSHOP_PASSWORD not set');

  test('Toolshop API: login with valid credentials returns a token @api', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<LoginResponse>({
      method: 'POST',
      url: ToolshopApi.LOGIN,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: { email: ENV.TOOLSHOP_EMAIL, password: ENV.TOOLSHOP_PASSWORD },
    });

    expect(status).toBe(200);
    expect(LoginResponseSchema.parse(body)).toBeTruthy();
  });
});
```

| `apiRequest` option | Type | Notes |
|---|---|---|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH'` | required |
| `url` | `string` | a `<Site>Api.*` path (append IDs: `` `${ToolshopApi.PRODUCTS}/${id}` ``) |
| `baseUrl` | `string` | `ENV.<SITE>_API_URL` |
| `body` | `Record<string, unknown>` | request payload |
| `headers` | `string` | the token for the Authorization header |
| `authType` | `'Bearer' \| 'Token' \| 'Basic'` | default `'Bearer'` |

The generic (`apiRequest<LoginResponse>`) gives compile-time types; the `parse` gives runtime validation. Use both.

**Tokens:** get one inside the test (a first `test.step('Sign in via POST /users/login')`) or in `beforeEach`. Toolshop tokens expire after **300 seconds**, so never cache them across a whole run. Once 3+ spec files need the same sign-in, promote it to a helper fixture (Phase 8).

**Naming and tags:** title `'<Site> API: <behaviour> @api'` (single tag at the end, as in `test-standards`). One `test.describe` per `METHOD path`.

## Phase 4 — `test.step` per call in multi-call tests

```ts
test('Toolshop API: signed-in customer can read their profile @api', async ({ apiRequest }) => {
  let token = '';

  await test.step('Sign in via POST /users/login', async () => {
    const { status, body } = await apiRequest<LoginResponse>({
      method: 'POST',
      url: ToolshopApi.LOGIN,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: { email: ENV.TOOLSHOP_EMAIL, password: ENV.TOOLSHOP_PASSWORD },
    });
    expect(status).toBe(200);
    expect(LoginResponseSchema.parse(body)).toBeTruthy();
    token = body.access_token;
  });

  await test.step('Read profile via GET /users/me', async () => {
    const { status, body } = await apiRequest<CurrentUser>({
      method: 'GET',
      url: ToolshopApi.CURRENT_USER,
      baseUrl: ENV.TOOLSHOP_API_URL,
      headers: token,
    });
    expect(status).toBe(200);
    expect(CurrentUserSchema.parse(body)).toBeTruthy(); // schema built from the contract in Phase 2
    expect(body.email).toBe(ENV.TOOLSHOP_EMAIL);
  });
});
```

Step names: `'<Verb> <thing> via <METHOD> <path>'`. A single-call test may skip `test.step`. See `references/test-step-patterns.md` for the forbidden version.

## Phase 5 — Status-code coverage

For each `METHOD path`, cover **every status code the contract lists**, plus:

| Scenario | Status | Assert |
|---|---|---|
| Happy path | 200/201 | schema parse + key fields match what was sent |
| No / expired token (protected endpoints) | 401 | status + `UnauthorizedResponseSchema` (or `toBeNull()` if no body) |
| Wrong role | 403 | status + schema or `toBeNull()` |
| Empty body (POST/PUT/PATCH) | 400/422 | error schema parse |
| Each required field omitted | 400/422 | one test per field (Phase 6) |
| Each field with wrong-type values | 400/422 | `for...of` per field (Phase 6) |
| Business-rule violation the contract lists | 422 | error schema + the field named in the message (e.g. Toolshop `billing_country`) |
| Non-existent ID | 404 | status (+ `NotFoundResponseSchema`) |
| Invalid path-parameter formats | 404/422 | fuzzing loop (Phase 6) |
| Unsupported method (if listed) | 405 | at least one test |
| Delete with no content | 204 | `expect(body).toBeNull()` |

Create shared resources once per describe (`beforeAll`/`afterAll` with Playwright's `request` from `playwright.request.newContext()`, or per test with `apiRequest`), and always clean up what you create on a shared demo.

## Phase 6 — Negative and validation coverage

For every endpoint that accepts a body:

1. **Empty body:** one test sending `{}`.
2. **Each required field omitted:** destructure + rest, one test per field.
3. **Each field with wrong-type values:** `for...of` over the matching `INVALID_*` from `data/invalid-values.ts`.
4. **Boundaries:** empty strings, negatives, too long, past/future dates, as the contract implies.

For every path parameter: a data-driven loop over invalid formats (numeric string, boolean-like, special characters, injection attempt), whether or not the contract mentions it.

**Where invalid values live (three tiers):**
1. Universal type mismatches → `data/invalid-values.ts` (`INVALID_STRING_VALUES`, `INVALID_NUMBER_VALUES`, `INVALID_BOOLEAN_VALUES`, `INVALID_ID_VALUES`, `INVALID_ENUM_VALUES`, `INVALID_ARRAY_VALUES`, `INVALID_OBJECT_VALUES`). Import; never redefine.
2. Site-specific curated sets (invalid emails, weak passwords, bad country/state pairs) → `data/<site>-invalid-data.ts`, `as const`. Never `.json`.
3. A boundary set used by exactly one field → inline in the spec. Promote it when a second field or file needs it.

Full code: `references/negative-testing.md`.

## Phase 7 — When the API disagrees with the contract

1. Keep the test exactly as the contract says (expected status and schema).
2. Mark it skipped with the reason right above it:

```ts
/* eslint-disable playwright/no-skipped-test */
// FIXME: POST /invoices returns 500 instead of the documented 422 for a missing billing_city — reported <link or date>
test.skip('Toolshop API: invoice without billing_city is rejected @api', async ({ apiRequest }) => {
  // ...test body as the contract says it should work...
});
```

3. Never edit the expected status to match the bug. Register it in `docs/DEFECTS.md` and put the ID in the comment (`// FIXME: DEF-NNN …`), list it in the site's test plan under suspected defects, and add a `docs/TEST_FIXES_KNOWLEDGE_BASE.md` entry if diagnosing it taught something. Which source wins when contract, plan and live API disagree: the bug oracle in `debugging` §3.
4. If the API returns a *different but valid* code than the contract (422 vs 400), assert the real one and comment the discrepancy.

## Phase 8 — Promote to a helper fixture (only when needed)

When the same multi-step setup/teardown (e.g. "sign in and empty the cart") is copied into 3+ spec files, move it into a helper fixture built on `plain-function.ts`, with setup before `use()` and teardown after it (teardown runs even when the test fails). Merge it in `fixtures/test.ts`. Pattern: `references/helper-fixture-example.md`.

| Use | When |
|---|---|
| `apiRequest` fixture | All API calls in tests, `beforeEach`/`afterEach`, one-off setup |
| Helper fixture | The same setup/teardown in 3+ spec files, with guaranteed cleanup |
| Builder function in `data/` | Generating payload data (no API call) |

## Link to the test plans

The site's **API test plan** (`test-plans/<site>/api/`, written with `api-test-planning`) is the primary input: each `API-<RES>-<NN>` case becomes a test (ID in a comment above it), its **Variations** table becomes a `for...of` loop, and its **Expected response** becomes status + schema assertions. Endpoint facts come from `api-context/<site>/INVENTORY.md`.


A test plan's **Backend checks** file (`test-plans/<site>/test-cases/NN-backend-checks.md`) is written in plain English. This skill turns each case into a spec: the case ID goes in a comment above the test (`// TC-API-04`), and the plain-English expected result becomes status + schema assertions.

## See also

- `references/examples.md` — Toolshop walkthroughs (login, token flow, validation lockdown).
- `references/negative-testing.md` — full Phase 6 code and the invalid-values table.
- `references/test-step-patterns.md` — forbidden multi-call and empty-body-only patterns.
- `references/helper-fixture-example.md` — the helper-fixture lifecycle.
- `references/troubleshooting.md` — ZodError, null bodies, status drift, expired tokens.
- `fixtures` skill (merging fixtures) · `data-config` skill (ENV, endpoints) · `test-standards` skill (titles, tags) · `debugging` skill (when a run goes red) · `test-planning` skill (the backend-checks cases).
