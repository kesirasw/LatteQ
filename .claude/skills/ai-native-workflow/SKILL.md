---
name: ai-native-workflow
description: Entry-point router for AI-assisted QA work on LatteQ. Owns the 6-phase workflow (classify → route → context (ui-context map first, chrome-devtools CLI crawl only if needed) → apply → verify → report) and the routing table that picks the specialised skill. Load first whenever the user starts a non-trivial task — "add a test for X", "automate this site", "create a page object", "this test is flaky", "refactor Y", "review my branch" — or asks "which skill should I use?" / "how do we work with AI here?".
---

# AI-Native Workflow

Routing layer between user intent and the skills that own the rules. This skill never restates their rules; it says **which skill to load, in what order**, and **when to stop and ask**.

## Critical

- **Missing input means you are still gathering context.** If the URL, flow, expected result or credentials aren't known, ask the user before writing any code (Phase 3).
- **Ask, don't invent.** Never guess a URL, label, button name, message text, env-var name or file path. Use `ls`/`grep`, the site's `ui-context` map, or ask.
- **Map first, crawl second.** Read `ui-context/<site>/MAP.md` before touching a browser. Crawl only via the chrome-devtools CLI, and only for what the map lacks (`ui-context` decides).
- **No placeholders.** A page object with `// TODO locator` or a test with no assertion is a failure, not progress.
- **Verify the premise, even for one-liners.** Open the file and confirm the defect is really there before "fixing" it.
- **CLAUDE.md is the floor.** Its MUST/WON'T tables beat anything in a skill or template.
- **One skill at a time.** Load the next skill when you reach its step, not all up front.
- **Red means `debugging`.** After any test edit, run the affected tests. On failure load `debugging` — never bump timeouts, never wrap in `.catch`.
- **Plans are reviewed before automation.** After a crawl, the test plan and test cases are written and then handed to a person to review and validate. Automation starts only when the plan's Status is **Approved** (`test-planning`, `api-test-planning`).

## The 6 Phases

| # | Phase | What happens | Owned by |
|---|-------|--------------|----------|
| 1 | **Classify** | codegen / edit / refactor / debug / context / config / review | — |
| 2 | **Route** | Pick the first skill from the table below | — |
| 3 | **Context** | Read existing pages/specs and the site's `ui-context` map; crawl (chrome-devtools CLI) only the states the map lacks. Missing a primary input → ASK now. | `ui-context` → `chrome-devtools-cli` (UI), `debugging` (failures), `grep` impact (refactor) |
| 4 | **Apply** | Edit per the leaf skill. Re-read its Critical block before finishing. | leaf skill |
| 5 | **Verify** | `npm run verify` + `npx playwright test <affected files>`. Red → `debugging`. | `debugging` on red |
| 6 | **Report + learn** | Files changed, which context was used ("reused ui-context/<site>/MAP.md, no crawl" or what was crawled), test result (pass/fail counts), anything skipped, open unknowns and risks. Save what was learned (table below). Ask before committing. | — |

Risks worth naming in the report: the target is a third-party site with bot protection or consent walls (Booking.com, GitHub search), the flow needs login, the element lives in canvas/SVG (Highcharts), or a locator or expected outcome was inferred rather than seen in a map or snapshot.

## Routing Table

| User intent | First skill | Then |
|-------------|-------------|------|
| "Automate / add a test for <site or flow>" | `ui-context` | (`chrome-devtools-cli` if crawl needed) → `test-planning` if the site has no plan → **review: plan Approved** → `page-objects` → `selectors` → `fixtures` → `test-standards` |
| "Write a test plan / test cases for <site>" | `ui-context` (crawl if no map) | `test-planning` → `test-plans/<site>/` → **stop for review** |
| "Map / crawl / refresh the UI of <site>" | `ui-context` | `chrome-devtools-cli` |
| "Write an API test plan / API test cases for <site or resource>" | `api-test-planning` | `api-context` inventory → `test-plans/<site>/api/` → **stop for review** → `api-testing` once Approved |
| "Add API tests / automate backend checks for <endpoint or site>" | `api-testing` | **plan Approved?** → contract (OpenAPI) → `data-config` (endpoints) → `fixtures` → `debugging` |
| "Add / change a page object" | `page-objects` | `ui-context`, `selectors`, `fixtures` |
| "This locator is wrong / strict mode violation" | `selectors` | `ui-context` (refresh state), `debugging` |
| "Add a spec / restructure tests / tagging" | `test-standards` | `fixtures`, `page-objects` |
| "Test failing / flaky / timeout" | `debugging` | `selectors`, `page-objects`, `data-config` |
| "Is this a bug or the test?" / "the site changed, heal the test" | `debugging` (§3 bug oracle, §5 assisted healing) | `ui-context`, `page-objects` |
| "Why do we do X / why not Y?" | `docs/decisions/` | the skill that owns X |
| "Add URL / env var / keyword / config change" | `data-config` | `fixtures` |
| "Add a util / helper / register fixture" | `fixtures` | `test-standards` |
| "Review my branch / PR" | `pr-reviewer` | routes per file |
| "How does AI work in this repo?" | this skill | — |
| "I am new / set up this repo / how do I use the skills in Claude or Copilot?" | `onboarding` | — |

No match → ask the user to clarify rather than guessing.

### Phase 6 — Save what was learned

Knowledge that stays in a chat, or in one person's agent memory, is lost to teammates and to Copilot. Before reporting, ask "did this task teach us something the next person would need?" and put it in the repo:

| Learned | Goes to | Owner skill |
|---------|---------|-------------|
| A site/environment-caused failure and its fix | `docs/TEST_FIXES_KNOWLEDGE_BASE.md` (+ Index row) | `debugging` |
| The product behaves wrongly | `docs/DEFECTS.md` + plan's suspected defects | `debugging` §3 |
| UI structure, locator, quirk, observed outcome | `ui-context/<site>/MAP.md` | `ui-context` |
| API contract gap or mismatch | plan's contract findings; `DEFECTS.md` if it's a defect | `api-test-planning` |
| A choice between real alternatives, or a reversed rule ("why don't we use X?") | `docs/decisions/NNN-*.md` | — |
| One person's preference (tone, shortcuts) | agent memory, not the repo | — |

Mention in the report what was saved where, or "nothing new to record".

## When to Stop and Ask

- The target URL, flow or expected result isn't stated.
- The page can't be loaded or snapshotted with the CLI (bot wall, login required). A cert error just needs `--acceptInsecureCerts`.
- Credentials are needed and `process.env` doesn't have them.
- Two valid designs with real trade-offs (e.g. new page object vs extend existing).
- The request conflicts with a CLAUDE.md rule — say so; never silently bypass.
- A test plan and its test cases have just been written, or automation is requested for a plan that isn't **Approved**: ask the user to review and validate it first.

## Example chain — "Add a test that DataTables paginates to page 2"

1. Classify: codegen. Route: `ui-context`.
2. Context: read `pages/DataTablesPage.ts`, the spec, and `ui-context/datatables/MAP.md`. The map already has `pagination` (`navigation "pagination"` with links "1"…"6") and `status` ("Showing 1 to 10 of 57 entries"), captured < 30 days ago → **no crawl**.
3. Apply (`page-objects`, `selectors`, `test-standards`): add `goToPage(n)` using `pagination.getByRole('link', { name: String(n), exact: true })`; new test asserting `status` shows "Showing 11 to 20". The page-2 status text is inferred, not observed, so crawl just that state first.
4. Verify → add the new row/state to the map → Report (context reused, one state crawled, test result).
