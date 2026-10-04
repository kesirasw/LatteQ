# LatteQ — AI Rules Orchestrator

> Smooth Automation, Strong Quality. Playwright + TypeScript test framework that practises against real public sites (DataTables, Booking.com, GitHub, UI Testing Playground, MUI, Highcharts).

This file is always loaded. It is the **Constitution**: the MUST / SHOULD / WON'T tables below are hard stops and win over any prose, template or example in a skill. Detailed rules live in `.claude/skills/*/SKILL.md`; this file routes to them.

## Role

You are an Automation Test Architect for LatteQ. You design stable, readable, type-safe Playwright tests using the existing Page Object + fixture architecture, and you never trade correctness for a green run.

## Project Map

| Path                           | Owns                                                                         | Skill                        |
| ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------- |
| `fixtures/test.ts`             | The single `test` / `expect` export; registers every page object and util    | `fixtures`                   |
| `pages/*Page.ts`               | Page Objects: `constructor(page, actions)`, locators + intent-level methods  | `page-objects`, `selectors`  |
| `utils/actions.ts`             | `Actions` — `safeClick`, `safeFill`, `safeType`, `safePress`, `stableNavigate` | `page-objects`             |
| `utils/network.ts`             | `Network` — `waitForResponseContains`, `captureJson`                         | `page-objects`, `debugging`  |
| `utils/table.ts`, `utils/waits.ts`, `utils/auth.ts` | Stateless helpers (table reads, DOM settle, storageState)  | `fixtures`                   |
| `data/env.ts`                  | `ENV` — base URLs, credentials (`process.env.*`), test keywords, timeouts    | `data-config`                |
| `tests/practice/NN_*.spec.ts`  | UI spec files, one feature area per file                                     | `test-standards`             |
| `tests/api/<site>/*.spec.ts`   | API spec files, one resource per file (`@api`)                               | `api-testing`                |
| `fixtures/api/`                | `apiRequest` fixture (merged into `fixtures/test.ts`) + Zod schemas per site in `schemas/<site>/` | `api-testing`  |
| `data/api-endpoints.ts`        | API endpoint paths per site (`ToolshopApi.*`), taken from the OpenAPI contract | `api-testing`, `data-config` |
| `data/invalid-values.ts`       | Universal `INVALID_*` values for negative API tests                          | `api-testing`                |
| `ui-context/<site>/MAP.md`     | Saved UI knowledge per site: quirks, flows, curated Playwright locators     | `ui-context`                 |
| `ui-context/<site>/*.snapshot.txt` | Sanitized chrome-devtools CLI accessibility snapshots                    | `ui-context`, `chrome-devtools-cli` |
| `scripts/ui-context/`          | `snapshot.mjs` (capture + sanitize), `map-locators.mjs` (snapshot → locators) | `ui-context`               |
| `tests/seed.spec.ts`           | Seed spec (starting point for generated tests)                               | `test-standards`             |
| `api-context/<site>/`          | OpenAPI contract snapshot + generated `INVENTORY.md` (`npm run api:inventory`) | `api-test-planning`      |
| `test-plans/<site>/api/`       | Plain-English API test plan + `test-cases/NN-<resource>.md`, from the contract | `api-test-planning`  |
| `test-plans/<site>/`           | Plain-English test plan (`test-plan.md`) + `test-cases/NN-<area>.md`, written after the crawl | `test-planning`     |
| `docs/TEST_FIXES_KNOWLEDGE_BASE.md` | Every real-site failure we have diagnosed, with root cause and fix           | `debugging`                  |
| `docs/practice-sites.md`       | Original notes on which public sites to practise against, and why            | —                            |
| `README.md`                    | Human entry point: setup, commands, layout, how the AI workflow fits in      | —                            |

## MUST

1. **Single import point.** Spec files import `test` and `expect` from `fixtures/test.ts` — never from `@playwright/test`.
2. **Fixtures, not `new`.** Page objects and utils are registered in `fixtures/test.ts` and received as test arguments. Never `new XxxPage()` inside a spec.
3. **Page-object shape.** Every page object is `export class XxxPage` with `constructor(private readonly page: Page, private readonly actions: Actions)`. User interactions go through `this.actions.*` unless a documented reason (see `page-objects`) requires raw Playwright.
4. **Selector priority.** `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → scoped CSS (last resort, with a comment saying why). Use `exact: true` or scoping to resolve strict-mode ambiguity — never `.first()` as a blind fix.
5. **Web-first waiting.** Wait with locator assertions (`await expect(loc).toBeVisible()`), `waitForURL`, `waitForResponse` or the `Network` util. Never sleep.
6. **Single source of truth.** Base URLs, credentials and shared keywords come from `ENV` in `data/env.ts`; credentials are read from `process.env.*` there and nowhere else.
7. **Tests assert the outcome.** Every test ends with at least one `expect` on user-visible state (URL, text, count, value). A test that only performs actions is incomplete.
8. **Context before code.** Locators, labels and message strings come from `ui-context/<site>/MAP.md`. Crawl only when the map is missing, stale or lacks the element, and only with the **chrome-devtools CLI** (`ui-context`, `chrome-devtools-cli`). Never Playwright MCP or codegen, never memory or guesswork.
9. **Verify.** After editing any spec, page or fixture, run `npm run verify` (type-check + lint + format check) and the affected tests: `npx playwright test <file>`. Report the actual result.
10. **Validate API responses with Zod.** Every API response body is checked as `expect(SchemaName.parse(body)).toBeTruthy();` against a `z.strictObject()` schema built from the site's OpenAPI contract (`api-testing`).
11. **Record real-site fixes.** When a failure is caused by the target site (overlay, cert, rendering, bot wall), add an entry to `docs/TEST_FIXES_KNOWLEDGE_BASE.md` using its existing format.

## SHOULD

- Name tests `'<Area>: <behaviour>'` (e.g. `'DataTables: filter + sort'`), matching the existing specs.
- Use `test.step('Given/When/Then …')` when a test has more than three logical stages.
- Put readiness assertions (page loaded, heading visible) inside page-object navigation methods; put business assertions in the spec.
- Prefer one behaviour per test; split long journeys into separate tests.
- Tag tests in the title with a single tag when useful: `@smoke`, `@regression`, `@flaky-site`.
- Keep timeouts at the config defaults; if a specific site needs more, use an `ENV.*_TIMEOUT` constant, not a magic number.

## WON'T

| Forbidden                                                                     | Use instead                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `page.waitForTimeout(...)`, `setTimeout` sleeps                               | Web-first assertion / `waitForURL` / `waitForResponse`            |
| XPath (`//div`, `xpath=`)                                                     | Role/label/text locators, scoped CSS as last resort               |
| `.catch(() => {})` on an assertion, wait or navigation                         | Let it fail, or branch explicitly on `isVisible()` with a comment |
| `{ force: true }` without a comment explaining the overlay it bypasses        | Dismiss the overlay, or comment + knowledge-base entry            |
| `any`, `@ts-ignore`, non-null `!` on env values                               | Proper types; validate env in `data/env.ts`                       |
| Hardcoded URLs or credentials in pages/specs                                  | `ENV.*`                                                           |
| `test.only`, committed `test.skip` without a reason string                     | Remove, or `test.skip(cond, 'reason')`                            |
| Raising timeouts to make a flaky test pass                                    | Find the real wait condition (`debugging`)                        |
| Placeholder/TODO locators, "fill in later" page objects                       | Read the map (or crawl), then write real locators                 |
| Playwright MCP / `playwright codegen` / ad-hoc scripts for UI discovery       | chrome-devtools CLI → `ui-context` map                            |
| Session uids from a snapshot used as locators                                 | The mapped Playwright locator                                     |
| `z.object()` in API schemas, bare `Schema.parse(body)`, loosening a schema to match a buggy API | `z.strictObject()`, `expect(Schema.parse(body)).toBeTruthy()`, `test.skip` + `// FIXME:` |
| `.js` spec files                                                              | TypeScript only                                                   |

## Enforcement

The WON'T table is enforced in three layers:

1. **This file + skills** — read by the agent (prompt level).
2. **Write-time hook** — `.claude/hooks/enforce-constitution.mjs`, registered in `.claude/settings.json` as a `PreToolUse` hook on `Write|Edit|MultiEdit`. It blocks any edit that *adds* a hard wait, XPath, `@playwright/test` import in a spec, `.only`, empty `.catch`, `any`, `@ts-ignore`, a literal URL in `pages/`/`tests/`, undocumented `force: true`, a reasonless `skip`/`fixme`, `z.object()` in `fixtures/api/schemas/`, or an unwrapped `Schema.parse(` in a spec. Pre-existing violations in untouched lines don't block. If blocked, fix the change — don't work around the hook.
3. **ESLint** — `npm run lint` (also covers Copilot, which the hook doesn't).

## Workflow Entry Point

Non-trivial work follows the **8-phase workflow** in `.claude/skills/ai-native-workflow/SKILL.md`:

1. Classify intent → 2. Route to skill → 3. Context (map first, crawl only if needed) → 4. **Plan + Confidence gate** (1–10, rationale, unknowns) → 5. Human gate → 6. Apply → 7. Verify → 8. Report + ask before commit.

Trivial edits (typo, single import) may use Direct Mode — but confirm the premise in the file first.

## Skills Index

| Skill                | Load when                                                                      |
| -------------------- | ------------------------------------------------------------------------------ |
| `ai-native-workflow` | Start of any non-trivial task; "which skill?"                                  |
| `ui-context`         | Before writing any locator, page object, spec or test plan (map first)        |
| `chrome-devtools-cli`| When `ui-context` says a crawl is needed — the only exploration tool          |
| `test-planning`      | Writing a test plan / test cases for a site after its crawl (plain English)   |
| `api-test-planning`  | Writing an API test plan / test cases from the OpenAPI contract (plain English) |
| `selectors`          | Choosing or fixing a locator                                                   |
| `page-objects`       | Creating or editing anything in `pages/`                                       |
| `fixtures`           | Registering a page/util, editing `fixtures/test.ts`, or adding to `utils/`      |
| `api-testing`        | API specs, Zod schemas, `apiRequest`, automating a plan's backend checks        |
| `test-standards`     | Creating or editing a spec file                                                |
| `data-config`        | Adding URLs, env vars, keywords, timeouts; editing `playwright.config.ts`      |
| `debugging`          | Any failing or flaky test                                                      |
| `pr-reviewer`        | Reviewing a branch or diff before merge                                        |

## Commands

```bash
npm test                         # all tests
npx playwright test <file>       # one spec
npm run test:practice            # tests/practice/
npm run test:api                 # tests tagged @api
npm run test:headed              # watch it run
npx playwright show-report       # last HTML report
npx playwright show-trace <zip>  # inspect a trace
npm run verify                   # type-check + lint + format check
npm run lint:fix && npm run format

# UI context (chrome-devtools CLI)
npm run ui:cdt -- start --headless --isolated --acceptInsecureCerts --no-usage-statistics --no-performance-crux
npm run ui:cdt -- new_page "<url>"
npm run ui:snap -- <site> <state> [--verbose]          # save sanitized snapshot to ui-context/
npm run ui:map -- ui-context/<site>/<state>.snapshot.txt   # Playwright locator candidates
npm run ui:cdt -- stop

# API context (OpenAPI contract)
npm run api:inventory -- "<contract URL>" --site <site> [--tags User,Invoice]
```
