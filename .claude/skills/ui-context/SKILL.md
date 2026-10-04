---
name: ui-context
description: Context-first UI knowledge for LatteQ — before writing any locator, page object, spec or test plan, read the site's saved page map in ui-context/<site>/MAP.md and its snapshots; only crawl (with the chrome-devtools-cli skill) when the map is missing, stale, lacks the needed element, or a run proves it wrong. Owns the crawl procedure, the accessibility-role → Playwright locator mapping rules, the MAP.md format, source/verification tags (cdt / run), and freshness/invalidation. Load whenever work touches pages/ or tests/, the user asks to automate a site or flow, write a test plan, or a test fails because the UI changed.
---

# UI Context

Build UI knowledge **once**, reuse it many times. A crawl produces snapshots + a curated `MAP.md` with ready-to-use Playwright locators; later page objects and specs are written from the map **without re-crawling**.

## Critical

- **Context first.** Read `ui-context/<site>/MAP.md` (and grep its `*.snapshot.txt`) before anything else. If it answers the question, **do not crawl**.
- **Crawl only with the chrome-devtools CLI** (`chrome-devtools-cli` skill). Never Playwright MCP, codegen, or discovery scripts.
- **Every locator in `pages/` must trace to the map** — either an existing row, or a row you add in the same change (from a snapshot).
- **Never store uids** as locators. Map rows are Playwright locators.
- **Don't invent.** An element that isn't in a snapshot or proven by a run doesn't go in the map. Mark gaps as gaps.
- **A run beats a snapshot.** If a passing test contradicts the map, fix the map; if a test fails with a locator error, the map for that state is suspect → refresh just that state.

## Decision: reuse or crawl?

```
MAP.md exists for the site?
├─ no  → full crawl of the needed states
└─ yes → does it have every element + state this task needs?
         ├─ yes → captured < 30 days ago, and no locator failure since? → USE IT (no crawl)
         │        └─ otherwise → refresh only the affected state(s)
         └─ no  → grep the snapshots for the element (it may be captured but not curated)
                  ├─ found → add the row to MAP.md (source: cdt), no crawl
                  └─ not found → crawl just the missing state
```

Say which branch you took in the Phase 4 proposal ("Context: reused ui-context/github/MAP.md, no crawl").

## Layout

```
ui-context/
  README.md                       index: site → map, captured date, last run-verified
  <site>/
    MAP.md                        curated: quirks, states & flows, locator table, gaps
    <state>.snapshot.txt          sanitized CLI snapshot (default tree)
    <state>.verbose.snapshot.txt  only when table structure etc. is needed
```

`<site>` = the fixture name (`datatables`, `github`, …). `<state>` = page + condition, kebab-case: `home`, `home.signin-modal`, `issues`, `react-select.age-open`.

## Crawl procedure

1. **Start** the CLI with project flags (`chrome-devtools-cli` → Session lifecycle); open the URL from `ENV` (`data/env.ts`) — ask if the site isn't there yet (`data-config`).
2. **Blockers first.** Snapshot. Consent banners, sign-in modals, region pop-ups → record (role, name, timing), dismiss, snapshot again. Bot wall / captcha → stop and tell the user.
3. **Save each state**: `npm run ui:snap -- <site> <state>`. Use `--verbose` capture for tables.
4. **Walk the flow** one action at a time (`click`/`fill`/`press_key` by uid), saving a state after each meaningful change. The diff between states = the outcome a test should assert (URL, heading, status text, new listbox…).
5. **Fill the gaps the snapshot can't see**: `data-testid`s and same-origin iframe contents via `evaluate_script`; network calls via `list_network_requests`.
6. **Generate candidates**: `npm run ui:map -- ui-context/<site>/<state>.snapshot.txt` → table of role/name → Playwright locator with uniqueness and scope.
7. **Curate `MAP.md`** (format below) — pick the rows the task needs, resolve every `AMBIGUOUS`, add quirks.
8. **Stop** the daemon. Update `ui-context/README.md`.

## Mapping rules (accessibility snapshot → Playwright)

| Snapshot | Playwright |
|---|---|
| `button "Save"` | `getByRole('button', { name: 'Save' })` |
| `image "Logo"` | `getByRole('img', { name: 'Logo' })` |
| `Iframe "Title"` | `getByTitle('Title').contentFrame()` (iframe is not an ARIA role) |
| `textbox "Email"` with a visible label | `getByLabel('Email')` is equivalent; prefer role unless the label is the clearer contract |
| `StaticText "…"` | `getByText('…')` — only for assertions on copy, never for clicking |
| `RootWebArea`, `generic` | not locatable by role; anchor on the nearest named ancestor |
| no name / duplicate name | scope: `page.getByRole('<landmark>', { name }).getByRole(...)`; else `filter({ hasText })`; `.first()` only if "any one" is the intent |
| `data-testid` (via evaluate_script) | `getByTestId('…')` — when no role+name is stable |

- **Substring trap**: `getByRole` name matching is case-insensitive *substring*. If another node of the same role contains the name (`Name` vs `Name: Activate to sort`), add `exact: true` — `ui:map` flags this.
- **Variable names** (counts "Issues 189", A/B copy, locale dates): use a regex for the stable part (`/^Issues/`, `/03:00.*1,048/`) or locate by role inside a unique container.
- **Native vs custom inputs**: if `fill` didn't set the value in the CLI, note it — the POM must type (`pressSequentially`).

## MAP.md format

```md
# <Site> — UI map

| | |
|---|---|
| Base URL | `ENV.X_URL` (…) |
| Captured | YYYY-MM-DD · chrome-devtools-mcp <ver> · headless Chrome (<locale>) |
| Snapshots | `state-a` · `state-b` |
| Used by | `pages/XPage.ts` · `tests/practice/NN_….spec.ts` |
| Last verified by run | YYYY-MM-DD (<spec> N/N) |

## Quirks            ← overlays, iframes, variants, hydration, locale, certs — each with the fix
## States & flows    ← | Step | Action | Observed outcome |
## Locators          ← | Key | Playwright locator | Source | Notes |
## Data              ← verified test data (labels, option texts) — optional
## Gaps              ← what is known to be missing
```

**Source** column: `cdt` (seen in a CLI snapshot) · `cdt (verbose)` · `run` (proven only by a passing Playwright test — e.g. iframe contents) · `cdt + run` · `not verified` (must be resolved before use).

Keys are the page-object property / method names, so POM ↔ map stay greppable.

## Freshness & invalidation

- **Stale after 30 days** (Captured date) → refresh the states you're about to use.
- **Locator failure in a run** (`debugging` classifies "site changed") → refresh that state, update rows, then fix the POM.
- After a green run that exercises a map, update **Last verified by run**.
- Refreshing = re-capture the state file (overwrites), re-run `ui:map`, update rows; note changes in Quirks if behaviour changed.

## Test plans

After a crawl, the test plan and test cases are written by the `test-planning` skill into `test-plans/<site>/`, in plain English, from this map's *States & flows*, *Quirks* and *Gaps*. Keep flow step IDs (C1, K4 …) stable — test cases reference them.
