---
applyTo: "pages/**/*.ts"
---

# Page objects & selectors (full rules: `.claude/skills/page-objects/SKILL.md`, `.claude/skills/selectors/SKILL.md`)

- Shape: `export class XxxPage` with `constructor(private readonly page: Page, private readonly actions: Actions)`; locators are `readonly` fields set in the constructor.
- Register every new page in `fixtures/test.ts`.
- Interactions go through `this.actions.safeClick / safeFill / safeType / safePress / stableNavigate`. Raw `click()` / `page.keyboard` only with a comment naming the reason.
- URLs from `ENV` (`data/env.ts`), never literals.
- Selector priority: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → scoped CSS with a comment. No XPath, no hashed classes or generated IDs.
- Strict-mode ambiguity: `exact: true` → scope to container → `filter({ hasText })` → more specific role. `.first()` only when "any one" is the intent and the method name says so.
- Portals (MUI options) are queried from `page`, not the trigger container.
- No `.catch(() => {})`. Optional elements (consent banners) use an explicit `if (await loc.isVisible())` with a comment.
- `force: true` only with a comment naming the overlay and a `TEST_FIXES_KNOWLEDGE_BASE.md` entry.
- Methods are user intents (`search`, `sortByHeader`), with a one-line JSDoc. Navigation methods end with a readiness assertion; business assertions belong in specs.
- Every locator must come from `ui-context/<site>/MAP.md` (or be added there from a chrome-devtools CLI snapshot in the same change), never from guesswork. Use the map's Key column as the property name.
