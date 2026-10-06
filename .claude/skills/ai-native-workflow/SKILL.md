---
name: ai-native-workflow
description: Entry-point router for AI-assisted QA work on LatteQ. Owns the 8-phase workflow (classify → route → context (ui-context map first, chrome-devtools CLI crawl only if needed) → plan+confidence → human gate → apply → verify → report), the confidence-gate format every non-trivial proposal must use, and the routing table that picks the specialised skill. Load first whenever the user starts a non-trivial task — "add a test for X", "automate this site", "create a page object", "this test is flaky", "refactor Y", "review my branch" — or asks "which skill should I use?" / "how do we work with AI here?".
---

# AI-Native Workflow

Routing layer between user intent and the skills that own the rules. This skill never restates their rules; it says **which skill to load, in what order**, and **when to stop and ask**.

## Critical

- **Confidence < 5 means you are still gathering context.** Do not write a proposal. Go back to Phase 3 and ask the user for the missing input (URL, flow, expected result, credentials).
- **Ask, don't invent.** Never guess a URL, label, button name, message text, env-var name or file path. Use `ls`/`grep`, the site's `ui-context` map, or ask.
- **Map first, crawl second.** Read `ui-context/<site>/MAP.md` before touching a browser. Crawl only via the chrome-devtools CLI, and only for what the map lacks (`ui-context` decides).
- **No placeholders.** A page object with `// TODO locator` or a test with no assertion is a failure, not progress.
- **Verify the premise, even for one-liners.** Open the file and confirm the defect is really there before "fixing" it.
- **CLAUDE.md is the floor.** Its MUST/WON'T tables beat anything in a skill or template.
- **One skill at a time.** Load the next skill when you reach its step, not all up front.
- **Red means `debugging`.** After any test edit, run the affected tests. On failure load `debugging` — never bump timeouts, never wrap in `.catch`.

## The 8 Phases

| # | Phase | What happens | Owned by |
|---|-------|--------------|----------|
| 1 | **Classify** | codegen / edit / refactor / debug / context / config / review | — |
| 2 | **Route** | Pick the first skill from the table below | — |
| 3 | **Context** | Read existing pages/specs and the site's `ui-context` map; crawl (chrome-devtools CLI) only the states the map lacks. Missing a primary input → ASK now. | `ui-context` → `chrome-devtools-cli` (UI), `debugging` (failures), `grep` impact (refactor) |
| 4 | **Plan + Confidence** | Emit the proposal block below | this skill |
| 5 | **Human gate** | Wait for approve / reject / rework. Reject → back to 3 with the stated gap. | — |
| 6 | **Apply** | Edit per the leaf skill. Re-read its Critical block before finishing. | leaf skill |
| 7 | **Verify** | `npm run verify` + `npx playwright test <affected files>`. Red → `debugging`. | `debugging` on red |
| 8 | **Report** | Files changed, test result (pass/fail counts), anything skipped, open unknowns. Ask before committing. | — |

### Phase 4 — Proposal format (mandatory)

```
## Proposal
- Scope: <files to create/change and what changes in each>
- Context: <"reused ui-context/<site>/MAP.md, no crawl" | "crawled <states> (map was missing/stale/lacked X)">
- Approach: <locator strategy / fixture wiring / fix, in 1-3 lines>
- Trade-offs: <if any, else "none">
- Confidence: <1-10> (<low|medium|high>)
- Rationale: <one line per +/- factor>
- Unknowns: <list, or "none">
```

**Confidence thresholds** (canonical — other skills link here):

- **< 5** → don't propose. Ask the user questions for the missing input.
- **5–7** → propose with explicit unknowns; proceed only if the user accepts them.
- **≥ 8** → evidence in hand (every locator is in a fresh map or a new snapshot, existing patterns read); proceed.
- **≥ 9** only if every locator is a `cdt` or `run` row in the map, the expected outcome is stated by the user or is an "Observed outcome" in the map, and no env/credential is missing.

LatteQ-specific confidence reducers: target is a third-party site with bot protection or consent walls (Booking.com, GitHub search), the flow needs login, or the element lives in canvas/SVG (Highcharts).

## Routing Table

| User intent | First skill | Then |
|-------------|-------------|------|
| "Automate / add a test for <site or flow>" | `ui-context` | (`chrome-devtools-cli` if crawl needed) → `page-objects` → `selectors` → `fixtures` → `test-standards` |
| "Write a test plan / test cases for <site>" | `ui-context` (crawl if no map) | `test-planning` → `test-plans/<site>/` |
| "Map / crawl / refresh the UI of <site>" | `ui-context` | `chrome-devtools-cli` |
| "Write an API test plan / API test cases for <site or resource>" | `api-test-planning` | `api-context` inventory → `test-plans/<site>/api/` → `api-testing` |
| "Add API tests / automate backend checks for <endpoint or site>" | `api-testing` | contract (OpenAPI) → `data-config` (endpoints) → `fixtures` → `debugging` |
| "Add / change a page object" | `page-objects` | `ui-context`, `selectors`, `fixtures` |
| "This locator is wrong / strict mode violation" | `selectors` | `ui-context` (refresh state), `debugging` |
| "Add a spec / restructure tests / tagging" | `test-standards` | `fixtures`, `page-objects` |
| "Test failing / flaky / timeout" | `debugging` | `selectors`, `page-objects`, `data-config` |
| "Add URL / env var / keyword / config change" | `data-config` | `fixtures` |
| "Add a util / helper / register fixture" | `fixtures` | `test-standards` |
| "Review my branch / PR" | `pr-reviewer` | routes per file |
| "How does AI work in this repo?" | this skill | — |
| "I am new / set up this repo / how do I use the skills in Claude or Copilot?" | `onboarding` | — |

No match → ask the user to clarify rather than guessing.

## Direct Mode

For trivial work (typo, single import, rename a local variable) apply and report. The user can say "just do it" to stay in Direct Mode for trivial edits this session. Substantive changes still go through all 8 phases.

## When to Stop and Ask

- The target URL, flow or expected result isn't stated.
- The page can't be loaded or snapshotted with the CLI (bot wall, login required). A cert error just needs `--acceptInsecureCerts`.
- Credentials are needed and `process.env` doesn't have them.
- Two valid designs with real trade-offs (e.g. new page object vs extend existing).
- The request conflicts with a CLAUDE.md rule — say so; never silently bypass.

## Example chain — "Add a test that DataTables paginates to page 2"

1. Classify: codegen. Route: `ui-context`.
2. Context: read `pages/DataTablesPage.ts`, the spec, and `ui-context/datatables/MAP.md`. The map already has `pagination` (`navigation "pagination"` with links "1"…"6") and `status` ("Showing 1 to 10 of 57 entries"), captured < 30 days ago → **no crawl**.
3. Proposal: add `goToPage(n)` using `pagination.getByRole('link', { name: String(n), exact: true })`; new test asserting `status` shows "Showing 11 to 20". Context: reused map. Confidence 8 (the page-2 status text is inferred, not observed → note as unknown, or crawl just that state).
4. Gate → Apply (`page-objects`, `selectors`, `test-standards`) → Verify → add the new row/state to the map → Report.
