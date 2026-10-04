# LatteQ

**Smooth Automation, Strong Quality.** A Playwright + TypeScript framework for practising real-world UI automation against public sites, with an AI-assisted QA workflow for Claude Code and GitHub Copilot.

## What's covered

| # | Area | Site | Spec | Practises |
|---|---|---|---|---|
| 01 | Tables | DataTables | `01_tables_datatables.spec.ts` | Search filtering, header sort buttons, live status text |
| 02 | Forms | Booking.com | `02_forms_booking.spec.ts` | Autocomplete, A/B variants, random modals, bot checks (runs on real Chrome) |
| 03 | SPA | GitHub | `03_spa_github.spec.ts` | Quick-search dialog, hydration races, custom inputs, issue filters |
| 04 | Edge cases | UI Testing Playground | `04_playground_uitp.spec.ts` | Dynamic IDs, slow page loads |
| 05 | Components | MUI Select | `05_components_mui.spec.ts` | Portal-rendered listboxes, duplicate labels |
| 06 | Charts | Highcharts | `06_charts_highcharts.spec.ts` | Cookie banner, iframes, SVG tooltips, locale-formatted names |
| 07 | Auth | GitHub login | `07_auth_storageState.spec.ts` | Saving and reusing `storageState` (needs `GH_USER` / `GH_PASS`) |

## Setup

```bash
npm install
npx playwright install chromium   # bundled browser for most specs
npx playwright install chrome     # Google Chrome, used by the Booking spec (skip if Chrome is installed)
```

Optional, for the auth spec: set `GH_USER` and `GH_PASS` (a GitHub account without 2FA) in your environment or a `.env` file. Never commit them.

## Commands

| Command | What it does |
|---|---|
| `npm test` | Run every spec (list + HTML report) |
| `npm run test:practice` | Run `tests/practice/` only |
| `npm run test:smoke` | Run tests tagged `@smoke` |
| `npx playwright test <file>` | Run one spec |
| `npm run test:ui` / `test:headed` / `test:debug` | Interactive UI mode / visible browser / Inspector |
| `npx playwright show-report` | Open the last HTML report (served locally, so traces work) |
| `npm run verify` | Type-check + ESLint + Prettier check. Run before every commit |
| `npm run lint:fix` / `npm run format` | Auto-fix lint / formatting |
| `npm run ui:cdt -- <command>` | chrome-devtools CLI, used to crawl a site |
| `npm run ui:snap -- <site> <state>` | Save a sanitized page snapshot to `ui-context/` |
| `npm run ui:map -- <snapshot>` | Turn a snapshot into Playwright locator suggestions |

Results land in `playwright-report/` (HTML) and `test-results/` (screenshots, videos and traces of failures). Both are git-ignored.

## Project layout

```
LatteQ/
├── tests/
│   ├── practice/NN_<area>_<site>.spec.ts   specs, one site per file
│   └── seed.spec.ts                        starting point for new specs
├── pages/<Site>Page.ts                     page objects: locators + user-intent methods
├── fixtures/test.ts                        the only test/expect export; wires pages + utils as fixtures
├── utils/                                  Actions (safe click/fill), Network, table, auth, waits helpers
├── data/env.ts                             ENV: site URLs, credentials (from process.env), keywords, timeouts
├── ui-context/<site>/                      saved UI knowledge per site: MAP.md + accessibility snapshots
├── scripts/ui-context/                     snapshot capture + snapshot→locator mapper
├── specs/                                  markdown test plans
├── docs/
│   ├── TEST_FIXES_KNOWLEDGE_BASE.md        every real-site failure diagnosed so far, with the fix
│   └── practice-sites.md                   original notes on which sites to practise against
├── CLAUDE.md, .claude/                     Claude Code rules, skills and write-time check
├── .github/                                Copilot instructions, /pr-reviewer prompt, setup workflow
├── playwright.config.ts
└── eslint.config.mjs, tsconfig.json, .prettierrc.json
```

## How a test is written

1. **Read the site's map**: `ui-context/<site>/MAP.md` has its quirks, step-by-step flows with observed outcomes, and ready-to-use Playwright locators.
2. **Crawl only if the map lacks something**: use the chrome-devtools CLI (`npm run ui:cdt`), save the state with `ui:snap`, generate locators with `ui:map`, and add the rows to the map.
3. **Page object** in `pages/`: locators from the map, interactions through `this.actions.*`, URLs from `ENV`.
4. **Register it** in `fixtures/test.ts`.
5. **Spec** in `tests/practice/`: import `test`/`expect` from `fixtures/test.ts`, call page-object methods, and assert a user-visible outcome.
6. **Verify**: `npm run verify` and `npx playwright test <file>`.

```ts
import { test, expect } from '../../fixtures/test';

test('DataTables: search filters rows to the matching office @smoke', async ({ datatables }) => {
  await datatables.open();
  await datatables.search('London');

  await expect(datatables.status).toContainText('filtered from 57 total entries');
});
```

## Rules of the road

Enforced by ESLint, a Claude Code write-time check, and code review:

- No `waitForTimeout`, XPath, `test.only`, `any` / `@ts-ignore`, or empty `.catch(() => {})`.
- Locators: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → scoped CSS (with a comment).
- URLs and credentials only in `data/env.ts`.
- Every test asserts something the user would see.
- Flaky? Find the real wait condition. Don't raise timeouts or force clicks. Record site-caused fixes in `docs/TEST_FIXES_KNOWLEDGE_BASE.md`.

The full rule set is in [CLAUDE.md](CLAUDE.md).

## AI-assisted workflow

- **Claude Code** loads [CLAUDE.md](CLAUDE.md) and the skills in `.claude/skills/`. Non-trivial work follows 8 phases: classify → route → context (map first) → proposal with a 1–10 confidence score → your approval → apply → verify → report.
- **GitHub Copilot** uses [.github/copilot-instructions.md](.github/copilot-instructions.md) plus path-scoped rules in `.github/instructions/`, and a `/pr-reviewer` prompt.
- **UI exploration** uses the chrome-devtools CLI only (no Playwright MCP). What it learns is saved in `ui-context/`, so the same site is never crawled twice for the same element.

## Practice path (14 days)

| Days | Focus | Site |
|---|---|---|
| 1–2 | Tables, sorting, pagination | DataTables |
| 3–4 | Autocomplete, date pickers, modals | Booking.com |
| 5–6 | SPA search, hydration, filters | GitHub |
| 7 | Dynamic IDs, slow loads, hidden layers | UI Testing Playground |
| 8–9 | Portals, keyboard, accessibility roles | MUI |
| 10–11 | Extend: infinite scroll / lazy loading (pick a site from `docs/practice-sites.md`) | — |
| 12–13 | Iframes, SVG charts, network validation | Highcharts |
| 14 | Auth reuse with `storageState`, then build your own extension | GitHub login |

## Troubleshooting

| Symptom | Where to look |
|---|---|
| A test fails on a third-party site | `docs/TEST_FIXES_KNOWLEDGE_BASE.md`, then the site's `ui-context/<site>/MAP.md` Quirks |
| "strict mode violation" | Make the locator unique: `exact: true`, scope to a region, or `filter` |
| Element not found after a site update | Refresh that page state in `ui-context` with the CLI, then update the page object |
| Booking spec can't launch | Install Google Chrome: `npx playwright install chrome` |
| Auth specs skipped | Set `GH_USER` / `GH_PASS` |

Playwright docs: <https://playwright.dev> · [Best practices](https://playwright.dev/docs/best-practices) · [Locators](https://playwright.dev/docs/locators)
