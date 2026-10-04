# API testing — worked examples (Toolshop)

Phase numbers refer to `api-testing/SKILL.md`.

## 1. A new endpoint: `POST /users/login`

User: *"Add API tests for login."* (Test plan case TC-API-01.)

1. **Phase 1:** in the contract, `POST /users/login` documents only `200` (`TokenResponse`: `access_token`, `token_type`, `expires_in`). The wrong-credentials response isn't documented, so capture it live: `401 {"error":"Unauthorized"}`.
2. **Phase 2:** `LoginResponseSchema` in `fixtures/api/schemas/toolshop/userSchema.ts`. The 401 body uses `UnauthorizedResponseSchema` (FIXME: captured live).
3. **Phase 3:** happy path with `ENV.TOOLSHOP_EMAIL` / `ENV.TOOLSHOP_PASSWORD`.
4. **Phase 5 and 6:** wrong password → 401. Empty body, missing `email`, missing `password` → per contract or observed. `email` with `INVALID_STRING_VALUES`, plus malformed emails from `data/toolshop-invalid-data.ts`.

Result: `tests/api/toolshop/users.spec.ts` with one `describe('POST /users/login')`.

## 2. A token flow: sign in, then read the profile

User: *"Check that a signed-in customer can read their own profile."*

1. One test, two `test.step`s: `Sign in via POST /users/login` → `Read profile via GET /users/me` (Phase 4).
2. Pass the token from step 1 into `headers` in step 2.
3. Schema for `GET /users/me` from the contract. Assert the email matches `ENV.TOOLSHOP_EMAIL`.
4. Tokens expire after 300 s, so get a fresh one in the test, never at the start of the run.

## 3. Locking down a business rule: `POST /invoices`

User: *"Automate TC-API-04: an invoice with a state that doesn't belong to the country is refused."*

1. **Phase 1:** the contract lists `200, 401, 404, 405, 422` for `POST /invoices`. The 422 body isn't documented. It was seen live as `{"billing_country":["The billing_country does not match the entered address. The state does not belong to the selected country."]}`.
2. Steps: sign in → create a cart and add an item (contract paths in `ToolshopApi`) → `POST /invoices` with `billing_country: 'Austria'`, `billing_state: 'Vienna'`.
3. Assert `422`, `UnprocessableEntityResponseSchema.parse(body)`, and that `body.billing_country` exists.
4. **Phase 6:** add per-field omission and wrong-type loops for the invoice body. Put the bad country/state pairs in `data/toolshop-invalid-data.ts`.
5. Clean up: the cart is per user on a shared demo, so empty it in `afterEach`.
