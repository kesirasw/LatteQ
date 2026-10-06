# Defect Register

Product defects found while testing: the **site or API** is wrong, not the test. Test failures caused by the test or the environment go to [TEST_FIXES_KNOWLEDGE_BASE.md](TEST_FIXES_KNOWLEDGE_BASE.md) instead. How to decide which is which: the bug oracle in `.claude/skills/debugging/SKILL.md`.

## Rules

- **One row per defect, IDs never reused.** Next free ID: **DEF-004**.
- **The test keeps the correct expectation.** UI: `test.fail(true, 'DEF-NNN: <what is wrong>. Remove test.fail once fixed.')`. API: `test.skip` with `// FIXME: DEF-NNN …` (api-testing, Phase 7). Never change an assertion to match the defect.
- **Oracle** says which source proves it's wrong: `Requirement`, `Contract` (OpenAPI), `Plan` (test case expected result), or `Heuristic` (consistency, readable text, errors explained; a heuristic alone keeps the status at *Suspected* until a person confirms it).
- **Status:** `Suspected` (the test says so, nobody has confirmed it) → `Confirmed` (a person or the site owner agrees) → `Fixed` (the `test.fail` test started passing: remove `test.fail`, set the date) or `Rejected` (it's intended: update the plan's expected result **with the reason**, then the test).
- When a `test.fail` test unexpectedly passes, Playwright reports it as a failure. That is the signal to check the site and move the row to `Fixed`.

## Register

| ID | Site | Title | Status | Oracle | Found | Evidence | Notes |
|----|------|-------|--------|--------|-------|----------|-------|
| DEF-001 | Toolshop | A refused order (state doesn't match country) shows no message | Suspected | Plan (TC-CHK-11) + Heuristic | 2026-10-04 | `tests/toolshop/04_checkout_and_payment.spec.ts` TC-CHK-11; plan §9.1 | API answers 422 with a clear reason; nothing is shown and **Confirm** does nothing |
| DEF-002 | Toolshop | An expired sign-in at the last checkout step shows no message | Suspected | Plan (TC-CHK-12) + Heuristic | 2026-10-04 | `tests/toolshop/04_checkout_and_payment.spec.ts` TC-CHK-12; plan §9.2 | API answers 401; sign-ins last 5 minutes |
| DEF-003 | Toolshop | "Forgot password" confirmation shows the untranslated key `page.forgot-password.confirm` | Suspected | Plan (TC-AUT-07) + Heuristic | 2026-10-04 | `tests/toolshop/05_login_and_account.spec.ts` TC-AUT-07; plan §9.3 | |

## Not yet imported

- **Toolshop API findings 1–23** (`test-plans/toolshop/api/test-plan.md` §9, parked as `test.skip` + `// FIXME:` in `tests/api/toolshop/`; KB §15). Add them here with DEF IDs, and put the IDs in their FIXME comments, once that work is committed.
