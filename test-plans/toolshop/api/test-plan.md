# API test plan — Practice Software Testing (Toolshop)

| | |
|---|---|
| API | https://api.practicesoftwaretesting.com |
| Contract | https://api.practicesoftwaretesting.com/docs?api-docs.json (OpenAPI 3.2.0, version 5.0.0), snapshot in `api-context/toolshop/` (2026-10-04) |
| Related UI plan | [../test-plan.md](../test-plan.md) (its backend checks TC-API-01 to TC-API-05 are referenced here, not repeated) |
| Status | Draft, automated |
| Last updated | 2026-10-06 |

## 1. Purpose

Check that the Toolshop service behaves as its contract says for the core shopping journey: an account, a cart, a payment check and an order. The checks run directly against the service, without the website. They're faster than UI tests, they reach rules the website hides, and they catch security problems the website can't show (who can see or change what).

## 2. Scope

**In scope: the core shopping flow (5 resource groups, 47 operations)**

| Resource | Operations | Cases | File |
|---|---|---|---|
| Users and login | register, log in/out, renew key, profile, passwords, own record; customer refusals on admin operations | 35 | [01-users-and-login.md](test-cases/01-users-and-login.md) |
| Products | list, filter, sort, page, read, related, search; refusals on catalogue changes | 22 | [02-products.md](test-cases/02-products.md) |
| Carts | create, add, read, change quantity, remove, delete | 22 | [03-carts.md](test-cases/03-carts.md) |
| Payment check | all five methods and their validation | 10 | [04-payment.md](test-cases/04-payment.md) |
| Orders and invoices | place (customer and guest), list, read, search, PDF; refusals on changes | 24 | [05-invoices.md](test-cases/05-invoices.md) |

**Out of scope (this time)**

| What | Why |
|---|---|
| Brands, categories, images, product specs, favourites, contact messages, reports, TOTP, postcode lookup, live sales stream (41 operations) | Not part of the core shopping flow. Next slices, in that order of value. |
| Successful admin operations: creating, changing or deleting products; listing, searching or deleting users; changing invoices or their status | Need the admin account and would change data every visitor of the shared demo sees. Only the refusals for customers and anonymous callers are tested. |
| The HTTP QUERY versions of list and search (`QUERY /products`, `QUERY /products/search`, `QUERY /users/search`, `QUERY /invoices/search`) | A new HTTP method the test tool's request helper doesn't send yet. Each has a GET equivalent that is tested. Deferred. |
| Downloading a finished invoice PDF | The PDF is made in the background, at an unknown time. A test can't wait for it reliably. API-INV-19 and API-INV-20 cover the "not ready yet" answers. |
| Load and performance | The demo is shared and public (knowledge base §14: it fails under heavy parallel load). |

## 3. How we will test

- **Contract first.** Every expected result comes from the contract. Where the contract is silent (error bodies, statuses it doesn't list) one live call filled the gap, on 2026-10-06, and the case says **Seen in live response**.
- **Response shape checked on every call.** Each response is compared with the contract's description of it, and unexpected fields count as a failure. Where the contract is incomplete (findings 17 and 18), the missing parts were captured live and marked in the automation as "not in contract".
- **When the service and the contract disagree,** the case keeps what the contract (or common sense, for **Needs confirming**) says. The automated test is written exactly that way and parked as a known failure, with the finding number. It is never bent to pass. Where the service answers with a different but sensible code (for example **201 Created** instead of **200 OK** for a new invoice, or **422** instead of **400** for validation), the automated check accepts the real code and the difference is listed as a finding.
- **Data-driven validation.** Missing details, wrong kinds of value and badly formed IDs are single cases with a table of variations, run as loops.
- **Each test is independent.** Every test that needs an account registers its own throwaway customer and logs in itself. Tests that need a cart create their own. Nothing depends on another test's leftovers, so tests can run in any order and in parallel.
- **Run order:** no dependency between files. Suggested reading order is the file order (users, products, carts, payment, invoices), which follows the shopping journey.

## 4. Access and test data

- **Access key:** a test logs in with its own customer's email and password and gets an access key. Keys last **300 seconds**, so they're never shared between tests or kept between runs.
- **Accounts:** every test registers a new customer with a unique, clearly fake email address. No real or shared accounts are used, so nothing needs to be set up in environment settings. The published demo accounts (site map, "Demo accounts") are used only as data to search for (API-USR-32).
- **Address:** orders use the only billing address the shop accepts in practice: Austria, postcode 1010, house 1 → Marvin-Krenn-Gasse, Mittersill, Vorarlberg (site map, "Address validation").
- **Products:** taken from the live product list at the start of each test. The demo's data is reset from time to time and product IDs change, so no product ID is ever written into a test.
- **Data created and cleaned up:** carts are deleted at the end of the test that made them. Throwaway customers and invoices can't be deleted by a customer (deleting accounts needs the admin account, and invoices can't be deleted at all), so they're left behind. That's expected on this practice demo and is cleared by its periodic reset.
- **Shared-demo safety:** no test changes data other visitors see. The cases that try to change the catalogue without an access key (API-PRD-20, API-PRD-21) send no changes, so nothing changes even though the service doesn't check.

## 5. When testing starts and when it's done

**Starts when:** the contract snapshot is current (`npm run api:inventory` shows no change) and the demo answers (the product list loads).

**Done when:**
- every case in scope has an automated test;
- every test runs green, except those parked against a numbered finding;
- each parked test names its finding, and is re-checked (un-parked and run) whenever the demo or the contract changes;
- every **Needs confirming** case has an answer from the product owner, or is listed in section 9.

## 6. Risks and how we handle them

| Risk | Effect | How we handle it |
|---|---|---|
| The demo is shared and slows down or fails under parallel load | Random failures, refused logins | Two workers for Toolshop tests (as for the UI suite); every test makes few calls |
| The demo resets its data | Hard-coded IDs break | IDs are always read from live responses during the test |
| Access keys expire after 5 minutes | Long tests fail half-way | Each test logs in itself, at its start |
| Throwaway accounts and invoices pile up | Clutter on the demo | Unique, clearly fake addresses; cleared by the demo's reset |
| The contract changes | Expected results go stale | Re-run `npm run api:inventory` before each round; `git diff api-context/toolshop/openapi.json` shows what changed |
| Testing an unprotected operation could change shared data | Other visitors see wrong products | Those cases send no changes (API-PRD-20, API-PRD-21) |

## 7. Coverage

Checklist scenarios per operation: ✓ = covered (case number), n/a = doesn't apply, — = deliberately not covered (reason in the status column or section 2).

**Users and login**

| Operation | Success | No/invalid key | Role | Empty | Required | Wrong kind | Business rule | Not found | Bad IDs | Method | Conflict | Documented statuses |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `POST /users/register` | ✓01 | n/a | n/a | ✓03 | ✓04 | ✓05 | ✓06 07 08 09 | n/a | n/a | — | ✓02 | 201 ✓ · 400 ✓ as 422 (finding 10) · 401, 403 — no trigger on a public operation · 409 ✓ |
| `POST /users/login` | ✓10 | n/a | n/a | ✓12 | ✓12 | — | ✓11 | n/a | n/a | — | n/a | 200 ✓ |
| `GET /users/me` | ✓13 | ✓33 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✓35 | n/a | 200 ✓ · 401 ✓ |
| `GET /users/refresh` | ✓14 | ✓34 | n/a | n/a | n/a | n/a | ✓14 | n/a | n/a | — | n/a | 200 ✓ · 400 — no known trigger · 401 ✓ |
| `GET /users/logout` | ✓15 | ✓33 | n/a | n/a | n/a | n/a | ✓15 | n/a | n/a | — | n/a | 200 ✓ · 400 — no known trigger · 401 ✓ |
| `POST /users/change-password` | ✓16 | ✓33 | n/a | — | — | — | ✓17 18 | n/a | n/a | — | n/a | 200 ✓ · 401 ✓ |
| `POST /users/forgot-password` | ✓19 | n/a | n/a | ✓21 | ✓21 | — | ✓20 | n/a | n/a | — | n/a | 200 ✓ · 400 ✓ · 401, 403 — no trigger on a public operation |
| `GET /users/{userId}` | ✓22 | ✓33 | ✓23 | n/a | n/a | n/a | n/a | ✓24 | ✓24 | ✓35 | n/a | 200 ✓ · 401 ✓ · 404 ✓ · 405 ✓ |
| `PUT /users/{userId}` | ✓26 | ✓33 | ✓28 | ✓27 | ✓27 | — | ✓27 | — | — | ✓35 | ✓29 | 200 ✓ · 401 ✓ · 403 ✓ · 405 ✓ · 409 ✓ · 422 ✓ |
| `PATCH /users/{userId}` | ✓25 | ✓33 | ✓28 | n/a | n/a | ✓27 | ✓27 | — | — | ✓35 | ✓29 (PUT) | 200 ✓ · 401 ✓ · 403 ✓ · 405 ✓ · 409 via PUT · 422 ✓ |
| `DELETE /users/{userId}` | — admin | ✓33 | ✓30 | n/a | n/a | n/a | n/a | — admin | — admin | ✓35 | — admin | 204, 404, 409 — admin only · 401 ✓ · 403 ✓ · 405 ✓ |
| `GET /users` | — admin | ✓33 | ✓31 | n/a | n/a | n/a | n/a | n/a | n/a | ✓35 | n/a | 200 — admin only · 400 — no known trigger · 401 ✓ |
| `GET /users/search` | — admin | ✓33 | ✓32 | n/a | — | n/a | n/a | — | n/a | — | n/a | 200 — admin only · 401 ✓ · 404 — no known trigger |

**Products**

| Operation | Success | No/invalid key | Role | Empty | Required | Wrong kind | Business rule | Not found | Bad IDs | Method | Conflict | Documented statuses |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `GET /products` | ✓01–08 | n/a | n/a | n/a | n/a | ✓03 | ✓02 04–08 09 | n/a | n/a | ✓22 | n/a | 200 ✓ · 404 — no known trigger (a page past the end answers 200) · 405 ✓ |
| `GET /products/{productId}` | ✓10 | n/a | n/a | n/a | n/a | n/a | n/a | ✓11 | ✓12 | ✓22 | n/a | 200 ✓ · 404 ✓ · 405 ✓ |
| `GET /products/{productId}/related` | ✓13 | n/a | n/a | n/a | n/a | n/a | ✓13 | ✓14 | — | — | n/a | 200 ✓ · 404 ✓ · 405 — same route as 22 |
| `GET /products/search` | ✓15 | n/a | n/a | n/a | ✓17 | n/a | ✓16 | n/a | n/a | — | n/a | 200 ✓ · 404, 405 — no known trigger |
| `POST /products` | — admin | ✓20 | — | — | — | — | n/a | n/a | n/a | ✓22 | n/a | 200, 404, 422 — admin, changes the catalogue · 405 ✓ |
| `PUT` / `PATCH /products/{productId}` | — admin | ✓21 | — | — | — | — | n/a | — | — | ✓22 | n/a | 200, 404, 422 — admin · 405 ✓ |
| `DELETE /products/{productId}` | — admin | ✓18 | ✓19 | n/a | n/a | n/a | n/a | — admin | — | ✓22 | — admin | 204, 404, 409, 422 — admin · 401 ✓ · 405 ✓ |

**Carts**

| Operation | Success | No/invalid key | Role | Empty | Required | Wrong kind | Business rule | Not found | Bad IDs | Method | Conflict | Documented statuses |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `POST /carts` | ✓01 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✓22 | n/a | 201 ✓ · 404, 422 — no known trigger (no request body) · 405 ✓ |
| `POST /carts/{id}` | ✓03 | n/a | n/a | ✓05 | ✓06 | ✓07 | ✓04 08 09 | ✓10 | — | — | n/a | 200 ✓ · 404 ✓ · 405 — no known trigger · 422 ✓ |
| `GET /carts/{cartId}` | ✓02 | n/a | n/a | n/a | n/a | n/a | n/a | ✓11 | ✓12 | — | n/a | 200 ✓ · 404 ✓ · 405 — no known trigger |
| `PUT /carts/{cartId}/product/quantity` | ✓13 | n/a | n/a | ✓14 | ✓14 | ✓14 | ✓14 15 | ✓16 | — | — | n/a | 200 ✓ · 404 ✓ · 405 — no known trigger · 422 ✓ |
| `DELETE /carts/{cartId}/product/{productId}` | ✓17 | n/a | n/a | n/a | n/a | n/a | ✓19 | ✓18 | — | — | — | 204 ✓ · 404 ✓ · 401 — operation isn't protected (finding 20) · 405, 409, 422 — no known trigger |
| `DELETE /carts/{cartId}` | ✓20 | n/a | n/a | n/a | n/a | n/a | n/a | ✓21 | — | — | — | 204 ✓ · 404 ✓ · 401 — not protected (finding 20) · 405, 409, 422 — no known trigger |

**Payment check**

| Operation | Success | No/invalid key | Role | Empty | Required | Wrong kind | Business rule | Not found | Bad IDs | Method | Conflict | Documented statuses |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `POST /payment/check` | ✓01 | n/a | n/a | ✓08 | ✓02 06 07 | ✓09 10 | ✓03 04 05 | n/a | n/a | — | n/a | 200 ✓ (the only one documented; 422 seen, finding 14) |

**Orders and invoices**

| Operation | Success | No/invalid key | Role | Empty | Required | Wrong kind | Business rule | Not found | Bad IDs | Method | Conflict | Documented statuses |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `POST /invoices` | ✓01 | TC-API-05 | n/a | ✓07 | ✓08 | ✓09 10 11 | ✓13, TC-API-04 | ✓12 | n/a | ✓24 | ✓13 | 200 ✓ as 201 (finding 11) · 401 TC-API-05 · 404 ✓ · 405 ✓ · 422 ✓ |
| `POST /invoices/guest` | ✓22 | n/a | n/a | ✓23 | ✓23 | ✓23 | n/a | n/a | n/a | — | n/a | 200 ✓ as 201 · 422 ✓ |
| `GET /invoices` | ✓02 | ✓14 | ✓04 | n/a | n/a | n/a | n/a | n/a | n/a | ✓24 | n/a | 200 ✓ · 401 ✓ · 404 — no known trigger · 405 ✓ |
| `GET /invoices/{invoiceId}` | ✓03 | ✓14 | ✓04 | n/a | n/a | n/a | n/a | ✓05 | ✓06 | ✓24 | n/a | 200 ✓ · 401 ✓ · 404 ✓ · 405 ✓ |
| `PUT` / `PATCH /invoices/{invoiceId}` | — admin | ✓14 | ✓15 | — | — | — | n/a | — admin | — | ✓24 | n/a | 200, 404, 422 — admin · 401 ✓ · 405 ✓ |
| `PUT /invoices/{invoiceId}/status` | — admin | ✓14 | ✓16 | — | — | — | n/a | — admin | — | — | n/a | 200, 404, 405, 422 — admin · 401 ✓ |
| `GET /invoices/search` | ✓17 | ✓14 | ✓04 | n/a | ✓18 | n/a | n/a | — | n/a | — | n/a | 200 ✓ · 401 ✓ · 404, 405 — no known trigger |
| `GET …/download-pdf-status` | ✓19 | ✓14 | — | n/a | n/a | n/a | n/a | ✓21 | — | — | n/a | 200 ✓ · 401 ✓ · 404 ✓ · 405 — no known trigger |
| `GET …/download-pdf` | — (section 2) | ✓14 | — | n/a | n/a | n/a | n/a | ✓20 | — | — | n/a | 200 — PDF made in the background · 401 ✓ · 404 ✓ · 405 — no known trigger |

"No known trigger" means the contract lists the status, but neither the contract nor exploration shows a request that would produce it. Those are questions for the API owners (finding 22), not gaps in the plan.

## 8. Test case summary

Counted from the case files on 2026-10-06.

| File | Cases | Variations | High | Medium | Low | Documented in contract | Seen in live response | Needs confirming |
|---|---|---|---|---|---|---|---|---|
| Users and login | 35 | 46 | 11 | 18 | 6 | 24 | 10 | 1 |
| Products | 22 | 16 | 5 | 10 | 7 | 13 | 6 | 3 |
| Carts | 22 | 16 | 4 | 12 | 6 | 13 | 8 | 1 |
| Payment check | 10 | 7 | 1 | 6 | 3 | 2 | 6 | 2 |
| Orders and invoices | 24 | 39 | 9 | 10 | 5 | 16 | 5 | 3 |
| **Total** | **113** | **124** | **30** | **56** | **27** | **68** | **35** | **10** |

**21 cases** (plus 2 variations of API-INV-08 and 1 of API-USR-08) expect something the live service doesn't do today. Each points to a finding in section 9.

## 9. Contract findings and questions

Checked against the live service on 2026-10-06. **Security** findings come first.

**Security and money**

1. **Any customer can read every other customer's personal details** (API-USR-32). The contract doesn't say who may search users. Live, any logged-in customer searching for "Jane" gets the published demo customer's full record: email, phone, date of birth, home address. Listing all users is refused (API-USR-31), so search looks like an oversight. *Impact:* personal data leak. *Should:* **403 Forbidden** for customers.
2. **Anyone can change the catalogue without logging in** (API-PRD-20, API-PRD-21). The contract marks creating, replacing and changing products as unprotected; only deleting is protected. Live, an anonymous replace request answers **200 OK**, "success", and an anonymous create goes straight to validation. *Impact:* anyone can change names and prices. *Should:* **401 Unauthorized** without an admin access key.
3. **Customers can change their own issued invoices and mark their order as shipped** (API-INV-15, API-INV-16). The contract documents no 403 for these. Live, a customer gets **200 OK** for changing an invoice's address and for setting its status to **SHIPPED**. *Impact:* order records and fulfilment status can't be trusted. *Should:* **403 Forbidden** for customers.
4. **The same cart can be ordered more than once** (API-INV-13). Live, a second order for an already-ordered cart creates a second invoice, and the cart keeps its items after ordering. *Impact:* a double-click or retry charges the customer twice. *Should:* refuse (**409** or **422**), or empty the cart once it has been ordered.
5. **The raw database error is returned to the caller** (API-USR-29). Changing one's email to an address another customer uses should give **409 Conflict** (documented). Live it answers **403 Forbidden** with the database error text, including the database name, host and the SQL statement. *Impact:* leaks internal details useful to an attacker.

**Status codes the service doesn't honour**

6. **Renewing an access key without one crashes the server** (API-USR-34): **500** instead of the documented **401**.
7. **Server errors instead of validation answers:** an unknown sort value (API-PRD-09), related products of an unknown product (API-PRD-14, documented **404**), and an order whose payment details don't fit the method (API-INV-11) all answer **500**.
8. **The PDF status check doesn't match its contract** (API-INV-19, API-INV-21). Documented: **200** with a whole invoice, and **404** for an unknown invoice. Live: **400 Bad Request** with only a status (**NOT_INITIATED**), for real and unknown invoice numbers alike.
9. **A password reset without an email answers 404** (API-USR-21) instead of the documented **400**.
10. **Validation uses 422 where the contract says 400** (API-USR-03 to API-USR-05, API-USR-20). The service consistently uses **422 Unprocessable Entity**, which is reasonable. The contract should say so. The automated tests accept 422.
11. **A new invoice answers 201, not the documented 200** (API-INV-01, API-INV-22). **201 Created** is the better answer. The contract should change. The automated tests accept 201.
12. **Customer refusals answer 403 where the contract doesn't list it** (API-USR-31 `GET /users`, API-PRD-19 `DELETE /products/{productId}`). The behaviour is right. The contract should list 403.

**Validation the service doesn't do**

13. **Registration accepts a badly formed email address and people over 75** (API-USR-09, API-USR-08): "not-an-email" creates an account, although the contract says the email must be a valid address; so does a date of birth 80 years ago, although the contract allows only 18 to 75 years ago (under-18s are refused correctly).
14. **The payment check accepts nonsense** (API-PAY-08 to API-PAY-10): an empty request, a payment method that isn't offered and payment details that are just text all answer **200**, "Payment was successful". The contract documents only **200** for this operation, so it has no error answers at all.
15. **An order is accepted without a state or postal code** (API-INV-08), although the contract makes both required.
16. **Searching without a search phrase returns results** (API-PRD-17, API-INV-18), although the contract makes the phrase required. Products returns an empty page; invoices returns all the customer's invoices.

**Gaps in the contract** (the automation fills these from live responses and marks them)

17. **Error answers aren't described** for login (only success is documented), change password, forgot password, and every 422. The service uses four different error formats: `message`; `error`; `message` with a list of `errors`; and a plain list of fields with messages. Login failures use `error`, every other "not signed in" answer uses `message`.
18. **Response shapes are incomplete:** a cart is described as an ID only, but it also returns its items, discount and location. A single product also returns its specs. An invoice also returns eco-discount amounts and its payment. A guest invoice has no customer ID (empty). Invoice dates come in two formats (with and without a "T").
19. **User search is documented as a plain list,** but answers as a page (with page number, total and so on), like every other search.
20. **401 is documented on cart operations that aren't protected** (`DELETE /carts/{cartId}`, `DELETE /carts/{cartId}/product/{productId}`).

**Questions for the product owner**

21. **Changing the quantity of a product that isn't in the cart adds it** (API-CRT-15). Is that intended ("item added or updated"), or should it be **404** as documented?
22. **Statuses with no known trigger:** the contract lists 400 for `GET /users/refresh` and `GET /users/logout`, 404 for list and search operations, 405 for single-record reads, 409/422 for cart deletes. When do these happen?
23. **A password reset for an unknown email says the email is invalid** (API-USR-20). That tells anyone whether an address has an account. Should the answer be the same as for a registered email?

## 10. Automation

All 113 cases are automated (2026-10-06), one spec file per case file, in `tests/api/toolshop/`. A run gives **120 passing tests and 24 parked** (skipped with a FIXME naming the finding). Each parked test was run once un-skipped and failed for exactly the reason in its finding. Run: `npx playwright test tests/api/toolshop --project=toolshop`.

The order they were automated in, and why:

| Order | Case file | Spec file | Why this order |
|---|---|---|---|
| 1 | Users and login | `users.spec.ts` (next to TC-API-01) | Every other file needs a logged-in customer |
| 2 | Carts | `carts.spec.ts` | Orders need carts |
| 3 | Orders and invoices | `invoices.spec.ts` | Highest risk (money, findings 3 and 4) |
| 4 | Payment check | `payment.spec.ts` | Small, no set-up |
| 5 | Products | `products.spec.ts` (next to TC-API-02) | Read-only, lowest risk |

Within each file: High priority first. Tests for cases with an open finding are written exactly as the case says and parked (skipped) with the finding number in a comment. Un-parking one is a one-line change once the service is fixed.
