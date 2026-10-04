---
applyTo: "tests/**/*.ts"
---

# Spec files (full rules: `.claude/skills/test-standards/SKILL.md`)

- `import { test, expect } from '../../fixtures/test';` — never from `@playwright/test`.
- File name: `tests/practice/NN_<topic>_<site>.spec.ts` with the next free `NN`. TypeScript only.
- No raw `page.click/fill/goto/locator` in specs — call page-object methods.
- Title `'<Area>: <observable behaviour>'`; at most one tag at the end (`@smoke`, `@regression`, `@flaky-site`).
- Every test ends with an assertion on user-visible state. Prefer auto-retrying locator assertions (`toHaveCount`, `toContainText`, `toHaveURL`); use `not.toHaveCount(0)` instead of `expect(await x.count()).toBeGreaterThan(0)`.
- Never `.catch(() => {})` an assertion or wait. No `waitForTimeout`.
- `test.skip` / `test.fixme` need a reason string; no `test.only`.
- Use `test.step('Given/When/Then …')` for tests with more than three stages.
- Tests are independent (`fullyParallel: true`); shared setup goes in `beforeEach` or a fixture.
- Shared keywords from `ENV.TEST_KEYWORDS`.
- After editing, run `npx playwright test <file>` and report the result.
