---
name: test-planning
description: Write the test plan and test cases for a LatteQ site AFTER its UI crawl — in plain English Markdown, saved as test-plans/<site>/test-plan.md plus one readable file per feature area under test-plans/<site>/test-cases/. Owns the folder layout, file naming, the plan and test-case templates, plain-English writing rules, priority and confidence labels, and traceability back to ui-context/<site>/MAP.md. Load when the user asks for a test plan, test cases, test scenarios or test coverage for a site, or right after a ui-context crawl when the next step is planning. Not for writing Playwright code (that's page-objects / test-standards).
---

# Test Planning

Turn a crawled site (`ui-context/<site>/MAP.md`) into a test plan and test cases that **anyone on the team can read** — testers, developers, product owners — without knowing Playwright, locators or HTTP.

## Critical

- **Crawl first.** Plan only from `ui-context/<site>/MAP.md` (its *States & flows* and *Quirks*). No map → load `ui-context` and crawl before planning. Never plan from memory or guesses about the site.
- **Plain English only.** No locators, selectors, `data-test`, code, regexes, HTTP status codes, JSON, or tool names in steps and expected results. Describe what a person does and sees. Technical detail stays in the map; link to it with a *Map reference*.
- **Every expected result says where it came from**: **Seen during exploration** (the map recorded it) or **Needs confirming** (reasonable expectation not yet observed). Never present a guess as seen.
- **One behaviour per test case**, with a single clear expected result a person can check.
- **Defects are reported, not normalised**: when the site behaves wrongly, the expected result states the *correct* behaviour and the case is listed under *Suspected defects* with what was actually seen.
- **Readable file names**: lowercase, hyphenated, descriptive (`checkout-and-payment.md`), never `tc1.md` or `misc.md`.

## Folder layout

```
test-plans/
  README.md                         index of all sites and their plans
  <site>/                           same name as ui-context/<site>/ and the fixture
    test-plan.md                    the plan (template below)
    test-cases/
      01-<feature-area>.md          one file per feature area, numbered in journey order
      02-<feature-area>.md
      ...
```

Feature-area files follow the user journey, e.g. `01-browsing-and-search.md`, `02-product-details.md`, `03-shopping-cart.md`, `04-checkout-and-payment.md`, `05-login-and-account.md`, `06-contact-form.md`, `07-backend-checks.md` (service/API behaviour, still written in plain English).

## Writing rules (plain English)

| Write | Not |
|---|---|
| "Click **Add to cart**." | "Click `getByRole('button', { name: 'Add to cart' })`" |
| "The cart icon shows **2**." | "`cart-quantity` = 2" |
| "The order is rejected with a message explaining the address is invalid." | "POST /invoices returns 422" |
| "Wait until the product list has loaded." | "await expect(...).toBeVisible()" |
| "Sign in as a demo customer." | "login with customer@… / welcome01" (credentials live in `data/env.ts` / the map) |
| "Prices go from lowest to highest." | "`[data-test=product-price]` is sorted asc" |

- Use the site's own words for buttons, fields and messages, in **bold**, exactly as shown ("**Proceed to checkout**", "**Email is required**").
- Steps start with a verb: Open, Click, Type, Choose, Tick, Leave … empty.
- Expected results describe what is visible or what changes — never internal state.
- Test data in words: "a product that costs more than $10", "a new email address that has never been registered".
- Backend checks are still plain English: "Ask the shop's service to create an order with a state that doesn't belong to the chosen country → the service refuses it and explains why."

## Labels

| Label | Values |
|---|---|
| Priority | **High** (critical path, smoke) · **Medium** (important functionality) · **Low** (edge cases, nice to have) |
| Type | Functional · Negative · Validation · Navigation · Calculation · Backend · Accessibility |
| Basis | **Seen during exploration** · **Needs confirming** |
| ID | `TC-<AREA>-<NN>` — AREA is a short code per file (CAT, PRD, CRT, CHK, AUT, CON, API …), NN two digits, never reused |

## Test-case template (one section per case)

```md
### TC-CHK-03 — Checkout waits for the required address details

- **Priority:** High
- **Type:** Validation
- **Before you start:** Signed in as a demo customer, one product in the cart, on the **Billing Address** step.
- **Steps:**
  1. Leave **Postal code**, **House number** and **State** empty.
  2. Fill them in one at a time.
- **Expected result:** **Proceed to checkout** stays unavailable until all three are filled in, then becomes available.
- **Basis:** Seen during exploration
- **Map reference:** K4
```

Optional lines when useful: **Test data:**, **Notes:** (plain English hints for whoever automates it).

## Feature-area file template

```md
# <Feature area> — <Site name>

Part of the [<Site> test plan](../test-plan.md).

**What this covers:** one or two sentences.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-XXX-01 | … | High | Seen during exploration |

---

<test cases, one section each, in ID order>
```

## Test-plan template (`test-plan.md`)

```md
# Test plan — <Site name>

| | |
|---|---|
| Website | <plain URL> |
| Based on | Exploration on <date> — see `ui-context/<site>/MAP.md` |
| Status | Draft / Reviewed / Approved |
| Last updated | <date> |

## 1. Purpose            — why we're testing this site, in two or three sentences
## 2. What we will test  — bullet list of feature areas, each linking to its test-cases file
## 3. What we won't test — and why
## 4. How we will test   — browser tests, backend checks, what gets automated first
## 5. Test data and accounts — in words; where credentials come from (never the values)
## 6. When testing starts and when it's done — entry / exit criteria
## 7. Risks and how we handle them — table: risk · effect · what we do about it
## 8. Test case summary  — table per file: cases, High/Medium/Low, seen/needs confirming; totals
## 9. Questions and suspected defects — numbered; each defect: what should happen vs what was seen, with the case ID and its `DEF-NNN` from `docs/DEFECTS.md` once automated
## 10. Suggested order for automation
```

## Procedure

1. Read `ui-context/<site>/MAP.md` — *States & flows* become happy-path cases; *Quirks* become risks, data rules and negative cases; *Gaps* become **Needs confirming** cases or questions.
2. Group flows into feature areas → one file each, numbered in journey order.
3. Write cases (template above). Map reference = the flow step ID in the map (C2, K4 …).
4. Write `test-plan.md`; build the summary table by **counting** the cases in the files (don't estimate).
5. Add/refresh the site row in `test-plans/README.md`.
6. Check before handing over: no code/locators/status codes in any case (`grep -nE "getBy|data-test|\[[0-9]{3}\]|POST |GET |\`" test-plans/<site>/test-cases/*.md` should only hit nothing or plain-English quotes); every case has Priority, Basis and Map reference; counts match.

## After the plan

If the site has an API plan (`test-plans/<site>/api/`, `api-test-planning` skill), keep backend checks to what supports UI flows and reference API case IDs instead of duplicating them. Backend-check cases are automated with the `api-testing` skill (case ID in a comment above each test). Automation otherwise follows the normal workflow: `page-objects` and `test-standards` turn High-priority cases into specs, using locators from the map. When a **Needs confirming** case is automated and passes, update its Basis to **Seen during exploration** (or note "Confirmed by automated run on <date>") and the map's *Last verified by run*.
