---
name: ai-native-workflow
description: Entry-point router for AI-assisted QA work on LatteQ. Owns the 8-phase workflow (classify → route → explore → plan+confidence → human gate → apply → verify → report), the confidence-gate format every non-trivial proposal must use, and the routing table that picks the specialised skill. Load first whenever the user starts a non-trivial task — "add a test for X", "automate this site", "create a page object", "this test is flaky", "refactor Y", "review my branch" — or asks "which skill should I use?" / "how do we work with AI here?".
---

# AI-Native Workflow

Routing layer between user intent and the skills that own the rules. This skill never restates their rules; it says **which skill to load, in what order**, and **when to stop and ask**.

## Critical

- **Confidence < 5 means you are still exploring.** Do not write a proposal. Go back to Phase 3 and ask the user for the missing input (URL, flow, expected result, credentials).
- **Ask, don't invent.** Never guess a URL, label, button name, message text, env-var name or file path. Use `ls`/`grep`, the browser snapshot (`explore`), or ask.
- **No placeholders.** A page object with `// TODO locator` or a test with no assertion is a failure, not progress.
- **Verify the premise, even for one-liners.** Open the file and confirm the defect is really there before "fixing" it.
- **CLAUDE.md is the floor.** Its MUST/WON'T tables beat anything in a skill or template.
- **One skill at a time.** Load the next skill when you reach its step, not all up front.
- **Red means `debugging`.** After any test edit, run the affected tests. On failure load `debugging` — never bump timeouts, never wrap in `.catch`.

## The 8 Phases

| # | Phase | What happens | Owned by |
|---|-------|--------------|----------|
| 1 | **Classify** | codegen / edit / refactor / debug / explore / config / review | — |
| 2 | **Route** | Pick the first skill from the table below | — |
| 3 | **Explore** | Gather evidence: read existing pages/specs, snapshot the live page. Missing a primary input → ASK now. | `explore` (UI), `debugging` (failures), `grep` impact (refactor) |
| 4 | **Plan + Confidence** | Emit the proposal block below | this skill |
| 5 | **Human gate** | Wait for approve / reject / rework. Reject → back to 3 with the stated gap. | — |
| 6 | **Apply** | Edit per the leaf skill. Re-read its Critical block before finishing. | leaf skill |
| 7 | **Verify** | `npm run verify` + `npx playwright test <affected files>`. Red → `debugging`. | `debugging` on red |
| 8 | **Report** | Files changed, test result (pass/fail counts), anything skipped, open unknowns. Ask before committing. | — |

### Phase 4 — Proposal format (mandatory)

```
## Proposal
- Scope: <files to create/change and what changes in each>
- Approach: <locator strategy / fixture wiring / fix, in 1-3 lines>
- Trade-offs: <if any, else "none">
- Confidence: <1-10> (<low|medium|high>)
- Rationale: <one line per +/- factor>
- Unknowns: <list, or "none">
```

**Confidence thresholds** (canonical — other skills link here):

- **< 5** → don't propose. Ask the user questions for the missing input.
- **5–7** → propose with explicit unknowns; proceed only if the user accepts them.
- **≥ 8** → evidence in hand (live snapshot taken, existing patterns read); proceed.
- **≥ 9** only if every locator came from a snapshot, the expected outcome is stated by the user or visible on the page, and no env/credential is missing.

LatteQ-specific confidence reducers: target is a third-party site with bot protection or consent walls (Booking.com, GitHub search), the flow needs login, or the element lives in canvas/SVG (Highcharts).

## Routing Table

| User intent | First skill | Then |
|-------------|-------------|------|
| "Automate / add a test for <site or flow>" | `explore` | `page-objects` → `selectors` → `fixtures` → `test-standards` |
| "Write a test plan for <site>" | `explore` | saves to `specs/<area>.md` |
| "Add / change a page object" | `page-objects` | `explore`, `selectors`, `fixtures` |
| "This locator is wrong / strict mode violation" | `selectors` | `explore`, `debugging` |
| "Add a spec / restructure tests / tagging" | `test-standards` | `fixtures`, `page-objects` |
| "Test failing / flaky / timeout" | `debugging` | `selectors`, `page-objects`, `data-config` |
| "Add URL / env var / keyword / config change" | `data-config` | `fixtures` |
| "Add a util / helper / register fixture" | `fixtures` | `test-standards` |
| "Review my branch / PR" | `pr-reviewer` | routes per file |
| "How does AI work in this repo?" | this skill | — |

No match → ask the user to clarify rather than guessing.

## Direct Mode

For trivial work (typo, single import, rename a local variable) apply and report. The user can say "just do it" to stay in Direct Mode for trivial edits this session. Substantive changes still go through all 8 phases.

## When to Stop and Ask

- The target URL, flow or expected result isn't stated.
- The page can't be loaded / snapshotted (bot wall, cert error, login required).
- Credentials are needed and `process.env` doesn't have them.
- Two valid designs with real trade-offs (e.g. new page object vs extend existing).
- The request conflicts with a CLAUDE.md rule — say so; never silently bypass.

## Example chain — "Add a test that DataTables paginates to page 2"

1. Classify: codegen. Route: `explore`.
2. Explore: read `pages/DataTablesPage.ts` and `tests/practice/01_tables_datatables.spec.ts`; snapshot the page; find the pagination control's role/name.
3. Proposal: add `goToPage(n)` to `DataTablesPage` using `getByRole('link'|'button', { name: '2' })` scoped to the pagination nav; new test in `01_tables_datatables.spec.ts` asserting the info text changes. Confidence 8.
4. Gate → Apply (`page-objects`, `selectors`, `test-standards`) → Verify → Report.
