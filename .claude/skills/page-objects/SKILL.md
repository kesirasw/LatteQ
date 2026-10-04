---
name: page-objects
description: Page Object rules for LatteQ's pages/ folder — the XxxPage class shape with (page, actions) constructor, readonly locators, intent-level async methods, routing interactions through utils/actions.ts (safeClick, safeFill, stableNavigate), readiness vs business assertions, overlay handling, and using ENV URLs. Load when creating, extending or reviewing any file in pages/, or when a spec contains raw page.* interactions that belong in a page object.
---

# Page Objects

## Critical

- **Shape:** `export class XxxPage` in `pages/XxxPage.ts`, constructor `(private readonly page: Page, private readonly actions: Actions)`.
- **Register it** in `fixtures/test.ts` (see `fixtures`). Specs never call `new`.
- **Interactions go through `this.actions`** — `safeClick`, `safeFill`, `safeType`, `safePress`, `stableNavigate`. They wait for visible/enabled and verify filled values. Raw `locator.click()` / `page.keyboard` is allowed only with a comment saying why (e.g. element intercepted by a known overlay).
- **URLs from `ENV`** (`data/env.ts`), never string literals.
- **No swallowed failures.** No `.catch(() => {})` around waits, clicks or navigation. If a step is genuinely optional (a banner that only sometimes appears), branch explicitly:
  ```ts
  // Consent banner only shows for new sessions
  if (await this.acceptCookies.isVisible()) await this.actions.safeClick(this.acceptCookies);
  ```
- **Every locator from a snapshot** (`explore`) following `selectors`.

## Template

```ts
import { Page, Locator, expect } from '@playwright/test';
import { Actions } from '../utils/actions';
import { ENV } from '../data/env';

export class ExamplePage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly results: Locator;

  constructor(private readonly page: Page, private readonly actions: Actions) {
    this.heading = page.getByRole('heading', { name: 'Example', exact: true });
    this.searchBox = page.getByRole('searchbox', { name: 'Search' });
    this.results = page.getByRole('list', { name: 'Results' }).getByRole('listitem');
  }

  /** Open the page and wait until it is ready for interaction. */
  async open() {
    await this.actions.stableNavigate(ENV.EXAMPLE_URL);
    await expect(this.heading).toBeVisible();
  }

  /** Search for a term and wait for results to render. */
  async search(term: string) {
    await this.actions.safeFill(this.searchBox, term);
    await this.actions.safePress(this.searchBox, 'Enter');
    await expect(this.results.first()).toBeVisible();
  }
}
```

## Rules of thumb

- **Locators:** `readonly` fields assigned in the constructor. Use a method (`rowFor(name)`) when the locator needs a parameter.
- **Methods are user intents:** `search`, `sortByHeader`, `pickSimpleSelect` — not `clickButton3`. Name "any one of" methods honestly (`openFirstRepoResult`).
- **Assertions:** readiness assertions (heading visible, URL matches) live inside navigation/transition methods so the next step starts from a known state. Business outcomes (sorted, filtered, N results) are asserted in the spec, or via an `assertXxx()` method the spec calls explicitly.
- **Expose state for assertions** (`table`, `results`, `tooltip`) rather than returning booleans.
- **Return data, not locators, from reads:** `async getRowCount(): Promise<number>`.
- **JSDoc on action methods only**, one line, says what the user achieves.
- **Waiting:** web-first assertions, `this.page.waitForURL`, or the `Network` fixture. `utils/waits.ts#waitForDomSettled` is for animations only and must not replace an assertion.
- **One class per site/page.** Shared widgets (a cookie banner used on several pages of one site) can be a small component class composed into the page object.

## Before finishing

- [ ] No literal URLs; no `.catch(() => {})`; no `waitForTimeout`; no XPath.
- [ ] Every `force: true` / raw interaction has a comment and a knowledge-base entry.
- [ ] Registered in `fixtures/test.ts` with a short camelCase fixture name.
- [ ] `npm run verify` passes; the spec that uses it passes.
