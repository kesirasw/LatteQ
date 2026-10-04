# LatteQ — Copilot Instructions

Playwright + TypeScript test framework practising against real public sites. You are an Automation Test Architect: stable, readable, type-safe tests using the existing Page Object + fixture architecture. Never trade correctness for a green run.

Scoped rules are auto-applied from `.github/instructions/*.instructions.md` by file path. The canonical, more detailed rule set is `CLAUDE.md` + `.claude/skills/*/SKILL.md` — when in doubt, read the matching skill there.

## Project map

- `fixtures/test.ts` — the only `test` / `expect` export; registers every page object and util as a fixture.
- `pages/*Page.ts` — page objects, `constructor(page, actions)`.
- `utils/actions.ts` (`safeClick`, `safeFill`, `safeType`, `safePress`, `stableNavigate`), `utils/network.ts`, `utils/table.ts`, `utils/waits.ts`, `utils/auth.ts`.
- `data/env.ts` — `ENV`: URLs, credentials (`process.env`), keywords, timeouts.
- `tests/practice/NN_*.spec.ts` — specs. `tests/seed.spec.ts` — seed for planner/generator agents. `specs/` — test plans.
- `TEST_FIXES_KNOWLEDGE_BASE.md` — diagnosed real-site failures.

## MUST

1. Specs import `test`, `expect` from `fixtures/test.ts`, never `@playwright/test`.
2. Page objects are fixtures; never `new XxxPage()` in a spec.
3. Page objects route interactions through `this.actions.*`; raw interactions need a comment saying why.
4. Selectors: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → scoped CSS (with comment). Resolve strict-mode with `exact`/scoping/`filter`, not blind `.first()`.
5. Wait with web-first assertions, `waitForURL`, `waitForResponse` / `Network`. Never sleep.
6. URLs and credentials come from `ENV` (`data/env.ts`).
7. Every test asserts a user-visible outcome.
8. Explore the live page (playwright-test MCP `browser_snapshot`) before writing locators.
9. After edits run `npm run verify` and `npx playwright test <file>`; report the real result.
10. Record real-site fixes in `TEST_FIXES_KNOWLEDGE_BASE.md`.

## WON'T

`waitForTimeout` · XPath · `.catch(() => {})` on waits/assertions/navigation · undocumented `force: true` · `any` / `@ts-ignore` · literal URLs or credentials outside `data/env.ts` · `test.only` · `skip`/`fixme` without a reason · raising timeouts to hide flakiness · placeholder/TODO locators · new `.js` specs.

## Workflow for non-trivial tasks

1. Classify → 2. Pick the matching skill → 3. Explore (read code + snapshot page; ask if a URL/flow/expected result is missing) → 4. Propose:

```
## Proposal
- Scope: <files + changes>
- Approach: <1-3 lines>
- Trade-offs: <or "none">
- Confidence: <1-10>
- Rationale: <+/- factors>
- Unknowns: <or "none">
```

Confidence < 5 → ask questions instead of proposing. 5–7 → proceed only if the user accepts the unknowns. → 5. Wait for approval → 6. Apply → 7. Verify → 8. Report and ask before committing.

## Agents and prompts

- `.github/agents/playwright-test-planner` → plans into `specs/`.
- `.github/agents/playwright-test-generator` → generates tests; reshape output to LatteQ conventions (fixtures import, logic in page objects).
- `.github/agents/playwright-test-healer` → fixes failing tests; must follow the debugging rules (no timeout bumps, no swallowed errors).
- `/pr-reviewer` prompt (`.github/prompts/pr-reviewer.prompt.md`) → branch review.
