---
name: fixtures
description: Dependency-injection rules for LatteQ — fixtures/test.ts as the single test/expect export, how to register a new page object or util as a fixture, fixture naming, the Actions/Network utils, and when a helper belongs in utils/ (stateless function) vs a fixture (needs page). Load when editing fixtures/test.ts, adding anything to utils/, or when a spec imports from @playwright/test or instantiates classes directly.
---

# Fixtures & Utils

## Critical

- **`fixtures/test.ts` is the only place** that imports `test` from `@playwright/test` for spec use. It re-exports `expect`. Specs import both from here.
- **Every page object and page-bound util is a fixture.** Specs receive them as arguments: `async ({ datatables, network }) => {}`.
- **Page objects receive `actions`** from the fixture graph — don't construct a second `Actions`.
- **No test logic in fixtures** beyond construction and setup/teardown.

## Registering a page object

```ts
// 1. import
import { ExamplePage } from '../pages/ExamplePage';

// 2. type
type Fixtures = {
  // ...
  example: ExamplePage;
};

// 3. factory
export const test = base.extend<Fixtures>({
  // ...
  example: async ({ page, actions }, use) => await use(new ExamplePage(page, actions)),
});
```

Naming: short lowercase/camelCase site name matching existing ones (`booking`, `github`, `datatables`, `uitp`, `mui`, `highcharts`).

## Fixtures with setup/teardown

When a test needs state created and removed (auth state, a seeded record), put it in a fixture so cleanup always runs:

```ts
loggedInPage: async ({ browser }, use) => {
  const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
  const page = await context.newPage();
  await use(page);
  await context.close();
},
```

For login, prefer a Playwright **setup project** that writes `.auth/state.json` via `utils/auth.ts#saveStorageState`, and `use.storageState` in dependent projects (see `data-config`).

## utils/ vs fixture

| It… | Put it in |
|-----|-----------|
| needs `page` and holds no test-specific state (`Actions`, `Network`) | class in `utils/`, registered as a fixture |
| is a pure function over values or a locator (`getColumnText`, `isSortedAsc`) | exported function in `utils/`, imported directly |
| touches the file system / storage state (`utils/auth.ts`) | function in `utils/`, called from a fixture or setup project |

## Existing utils

- `Actions` — `safeClick`, `safeFill` (verifies value), `safeType`, `safePress`, `stableNavigate`.
- `Network` — `waitForResponseContains(urlPart, { status })`, `captureJson(urlPart, action)`.
- `utils/table.ts` — `getColumnText(table, col)`, `isSortedAsc`, `expectSortedAsc`.
- `utils/waits.ts` — `waitForDomSettled` (animations only, never instead of an assertion).
- `utils/auth.ts` — `AUTH_STATE_PATH`, `authStateExists`, `saveStorageState`.

Before adding a util, check these for something that already does it.
