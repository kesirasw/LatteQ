---
applyTo: "{fixtures,utils}/**/*.ts"
---

# Fixtures & utils (full rules: `.claude/skills/fixtures/SKILL.md`)

- `fixtures/test.ts` is the single export of `test` and `expect` for specs.
- Register a page object in three places: import, `Fixtures` type, `base.extend` factory `async ({ page, actions }, use) => await use(new XxxPage(page, actions))`.
- Fixture names are short lowercase site names (`booking`, `github`, `datatables`, `uitp`, `mui`, `highcharts`).
- Setup/teardown (auth contexts, seeded data) belongs in fixtures so cleanup always runs.
- `utils/`: page-bound classes (`Actions`, `Network`) become fixtures; pure functions (`table.ts`) are imported directly. Check existing utils before adding one.
- `waitForDomSettled` is for animations only — never a substitute for an assertion.
- No `any`, no `@ts-ignore`.
