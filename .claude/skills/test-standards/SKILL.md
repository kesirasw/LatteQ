---
name: test-standards
description: Spec-file standards for LatteQ — file naming (tests/practice/NN_area_site.spec.ts), imports from fixtures/test.ts, test titles '<Area>: <behaviour>', single tag, test.step Given/When/Then, outcome assertions, skip/fixme with reasons, keeping raw page.* calls out of specs, and running the affected tests. Load when creating or editing any *.spec.ts file or answering questions about test structure or tagging.
---

# Test Standards

## Critical

- **Import from fixtures:** `import { test, expect } from '../../fixtures/test';`
- **No raw interactions in specs.** Clicks, fills and navigation live in page objects. A spec reads like a user story: `await datatables.search('London')`.
- **Every test asserts an outcome** the user would see (URL, text, count, sorted order, value). Actions alone ≠ a test.
- **No swallowed assertions** — never `expect(...).catch(() => {})` or `waitForURL(...).catch(() => {})`.
- **`test.skip` / `test.fixme` always carry a reason string.** No `test.only` in committed code.
- **`test.fail` marks a registered product defect only:** `test.fail(true, 'DEF-NNN: <what is wrong>. Remove test.fail once fixed.')`, with the row in `docs/DEFECTS.md`, and the test still asserting the *correct* behaviour. Never use it for a flaky or unfinished test (write-time hook `expected-failure-without-defect`; bug oracle in `debugging` §3).
- **TypeScript only.** No new `.js` specs.
- **Run what you touched:** `npx playwright test <file>` and report the result.

## File layout

- `tests/practice/NN_<topic>_<site>.spec.ts` — next free `NN`, e.g. `08_upload_filepicker.spec.ts`.
- Full-application suites get their own folder, with files matching the plan's feature areas: `tests/<site>/NN_<area>.spec.ts` (e.g. `tests/toolshop/04_checkout_and_payment.spec.ts`). Titles start with the plan case ID: `'TC-CHK-07 Toolshop: placing an order @smoke'`.
- API specs: `tests/api/<site>/<resource>.spec.ts`, titled `'<Site> API: <behaviour> @api'` — rules in the `api-testing` skill.
- One site/feature area per file. Group related tests with `test.describe('<Area>', …)` when a file has more than one test.
- Test data that is used in more than one place → `ENV.TEST_KEYWORDS` (see `data-config`); one-off literals inline are fine.

## Test template

Illustrative — `rows` and `getColumn` show the shape a page object would expose; add them to `DataTablesPage` before using.

```ts
import { test, expect } from '../../fixtures/test';
import { ENV } from '../../data/env';

test.describe('DataTables', () => {
  test.beforeEach(async ({ datatables }) => {
    await datatables.open();
  });

  test('DataTables: filter narrows rows to matching office @smoke', async ({ datatables }) => {
    await datatables.search(ENV.TEST_KEYWORDS.datatables);

    await expect(datatables.rows.first()).toContainText(ENV.TEST_KEYWORDS.datatables);
  });

  test('DataTables: sort by Name orders ascending', async ({ datatables }) => {
    await test.step('When the user sorts by Name', async () => {
      await datatables.sortByHeader('Name');
    });

    await test.step('Then the Name column is in ascending order', async () => {
      const names = await datatables.getColumn(1);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });
  });
});
```

## Titles & tags

- Title: `'<Area>: <observable behaviour>'` — what should be true, not which buttons are clicked.
- At most **one** tag, at the end of the title: `@smoke` (fast, critical path), `@regression`, `@flaky-site` (target site is known to be unreliable — still must pass locally, the tag lets CI quarantine it).
- Run by tag: `npx playwright test --grep @smoke`.

## Steps

Use `test.step('Given/When/Then …')` once a test has more than three logical stages, or when a failure message alone wouldn't tell you which stage broke.

## Assertions

- Prefer locator assertions with auto-retry: `toBeVisible`, `toHaveText`, `toContainText`, `toHaveCount`, `toHaveURL`, `toHaveValue`.
- For counts that load asynchronously use `await expect(rows).not.toHaveCount(0)` instead of `expect(await rows.count()).toBeGreaterThan(0)` (the latter doesn't retry).
- Add a message to non-obvious value assertions: `expect(names, 'Name column should be sorted').toEqual(sorted)`.

## Independence

- Each test starts from `open()` / `beforeEach`; never depend on another test's leftovers.
- `fullyParallel: true` is on — tests in a file can run in any order.
- State that must persist (auth) goes through a fixture or setup project, not a test that "runs first".
