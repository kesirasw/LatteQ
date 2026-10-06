# LatteQ

**Smooth Automation, Strong Quality.**

## About the project

LatteQ is a Playwright + TypeScript test automation framework with an AI-assisted QA workflow built in. It pairs a conventional, well-structured test architecture (page objects, fixtures, typed configuration, contract-validated API checks) with a set of **skills**: written rules and procedures that AI coding assistants (Claude Code and GitHub Copilot) follow when they plan, write, debug and review tests.

The framework is exercised against real public websites and APIs rather than a sandbox, so the workflow is proven on the kind of behaviour real products show: overlays, A/B variants, slow rendering, bot checks and APIs that don't match their own documentation.

## Significance

AI assistants can write test code quickly, but left alone they tend to produce tests that are fast to write and expensive to keep: guessed locators, hard waits, assertions bent to match whatever the site does today, and fixes that live only in a chat history. LatteQ addresses that directly:

- **Context before code.** The assistant reads what is already known about a site (saved UI maps, API contracts) before writing anything, and explores a live page only when that knowledge is missing.
- **Correctness over a green run.** A failing test is checked against the requirement, contract and test plan before anything is changed. Product bugs are recorded and kept visible, not hidden by editing the expected result.
- **People review the plan and the result.** After a site is explored, the test plan and test cases are reviewed and validated by a person before anything is automated. Every task ends with a report (files changed, context used, test result, open unknowns), and nothing is committed or pushed without asking. Locator repairs after a site change are applied only with approval.
- **Rules that are enforced, not just written.** The same rules are applied at three levels: the skills the assistant reads, a check that blocks rule-breaking edits as they are written, and ESLint.
- **Knowledge that stays in the repo.** Every diagnosed failure, product defect, UI fact and design decision is saved as a file, so the next person (or assistant) starts from it instead of rediscovering it.

## Objective

- Provide a reusable, maintainable Playwright architecture for UI and API testing that new team members can pick up quickly.
- Define a repeatable AI-assisted workflow, from exploring a site to planning, automating, debugging and reviewing, that works the same way in Claude Code and GitHub Copilot.
- Show how to keep tests stable and trustworthy on real, changing sites without sleeps, retries or loosened assertions.
- Separate test bugs from product bugs with a clear decision process, and keep a record of both.
- Build up shared knowledge of each site and API in the repository, so work is never repeated.

## Skills

Skills live in [.claude/skills/](.claude/skills/) (one `SKILL.md` each) and are mirrored for Copilot in [.github/instructions/](.github/instructions/) and [.github/prompts/](.github/prompts/). [CLAUDE.md](CLAUDE.md) holds the non-negotiable rules and routes each kind of task to its skill. They are listed here in the order they are typically used.

| Skill | What it does | Use it when | Main files |
|---|---|---|---|
| `onboarding` | Guides a new QA or developer through installing the repo and browsers, proving the setup, and using the skills in Claude Code or Copilot; ends with a first task for their role | Someone is new, or asks how to set up the repo or use the skills | `README.md`, `.env.example` |
| `ai-native-workflow` | The entry point. Runs the 6-phase workflow: classify → route to a skill → gather context → apply → verify → report | Starting any non-trivial task, or unsure which skill applies | `CLAUDE.md` |
| `ui-context` | Reads the saved knowledge for a site before any locator, page object, test or plan is written; decides when a fresh crawl is needed and how to record what it finds | Any work that touches a site's UI | `ui-context/<site>/MAP.md`, snapshots |
| `chrome-devtools-cli` | Drives a real headless Chrome to explore a live page: accessibility snapshots, clicks, form input, network and console; saves clean snapshots for reuse | `ui-context` says the saved map is missing or out of date | `scripts/ui-context/` |
| `test-planning` | Writes a plain-English UI test plan and test cases after a site has been explored, each traced back to the site map, then stops for a person to review and approve it before automation | Planning test coverage for a website | `test-plans/<site>/` |
| `api-test-planning` | Writes a plain-English API test plan and test cases from the OpenAPI contract, covering every documented response, authentication, validation and business rule; lists where the contract and live API disagree, then stops for a person to review and approve it before automation | Planning test coverage for an API | `api-context/<site>/`, `test-plans/<site>/api/` |
| `selectors` | Chooses robust locators in a fixed priority order (role → label → placeholder → text → test id → scoped CSS) and resolves ambiguous matches properly | Writing or fixing any locator | `pages/` |
| `page-objects` | Defines the page-object shape: readonly locators, intent-level methods, interactions through the safe `Actions` helpers, readiness checks on navigation | Creating or changing anything in `pages/` | `pages/`, `utils/actions.ts` |
| `fixtures` | Wires page objects and helpers into tests through a single `test` / `expect` export; decides what belongs in a fixture versus a plain helper | Registering a page object or adding a helper | `fixtures/test.ts`, `utils/` |
| `data-config` | Keeps URLs, credentials, shared test data and timeouts in one typed place, read from environment variables; owns the Playwright configuration | Adding a URL, credential, data value or timeout, or changing the config | `data/`, `playwright.config.ts`, `.env.example` |
| `test-standards` | Sets the rules for spec files: naming, titles and tags, Given/When/Then steps, outcome assertions, and reasons for any skipped test | Creating or editing a UI spec | `tests/` |
| `api-testing` | Automates API checks against the contract: Zod schema validation of every response, status-code coverage, negative and path-parameter tests, and parking tests where the API breaks its contract | Writing API tests or response schemas | `tests/api/`, `fixtures/api/`, `data/api-endpoints.ts` |
| `debugging` | Investigates failing or flaky tests: classifies the failure, runs the bug oracle (is the product or the test wrong?), heals broken locators with approval, and records what was learned | A test fails, times out, flakes, or breaks after a site change | `docs/TEST_FIXES_KNOWLEDGE_BASE.md`, `docs/DEFECTS.md` |
| `pr-reviewer` | Reviews a branch or diff against the rules and the relevant skills, runs the checks and tests, and reports Blockers / Should fix / Nits | Before merging a branch or pull request | `.github/prompts/pr-reviewer.prompt.md` |

## Project structure

```
LatteQ/
├── CLAUDE.md                     rules for AI assistants and the skill index
├── .claude/
│   ├── skills/<skill>/SKILL.md   one folder per skill (see table above)
│   ├── hooks/                    write-time check that blocks rule-breaking edits
│   └── settings.json             registers the hook
├── .github/
│   ├── copilot-instructions.md   Copilot version of the rules
│   ├── instructions/             path-scoped Copilot rules, one per area
│   ├── prompts/                  /onboarding and /pr-reviewer prompts
│   └── workflows/                Copilot coding-agent setup
├── tests/
│   ├── practice/                 UI specs, one site per file
│   ├── <site>/                   UI specs for a full application, one feature area per file
│   └── api/<site>/               API specs, one resource per file
├── pages/                        page objects: locators + user-intent methods
├── fixtures/
│   ├── test.ts                   the only test / expect export; registers pages, helpers and apiRequest
│   └── api/                      apiRequest fixture and Zod response schemas per site
├── utils/                        Actions (safe click / fill / navigate), Network, table, auth and wait helpers
├── data/                         ENV (URLs, credentials, timeouts), API endpoints, test data, invalid values
├── ui-context/<site>/            saved UI knowledge: MAP.md + accessibility snapshots
├── api-context/<site>/           OpenAPI contract snapshot + generated endpoint inventory
├── test-plans/<site>/            plain-English UI test plan and test cases
│   └── api/                      plain-English API test plan and test cases
├── scripts/
│   ├── ui-context/               snapshot capture, snapshot → locator mapping, healing suggestions
│   └── api-context/              contract download and endpoint inventory
├── docs/
│   ├── TEST_FIXES_KNOWLEDGE_BASE.md   every diagnosed real-site failure and its fix
│   ├── DEFECTS.md                     product defect register (DEF-NNN)
│   ├── decisions/                     why each convention was chosen
│   ├── practice-sites.md              notes on the public sites used for practice
│   └── THIRD-PARTY-NOTICES.md         licences for adapted material
├── playwright.config.ts
├── eslint.config.mjs, tsconfig.json, .prettierrc.json
└── .env.example                  optional credentials and environment overrides
```
