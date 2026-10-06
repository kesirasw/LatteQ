---
name: onboarding
description: Guided onboarding for a new LatteQ team member (QA or developer) — check prerequisites, clone and install the repo, install browsers, set optional credentials, prove the setup with `npm run verify` and a smoke spec, then show how to drive the project's skills from Claude Code (CLAUDE.md + .claude/skills, slash commands, the confidence gate) or GitHub Copilot (.github/copilot-instructions.md, path-scoped instructions, prompt files, the Copilot coding agent), and hand them a role-specific first task. Load when someone says "I'm new", "onboard me", "set up this repo", "how do I install LatteQ", "how do I use the skills in Claude / Copilot", or "where do I start".
---

# Onboarding

Gets a new QA or developer from zero to a green run and their first AI-assisted test. This skill **runs the setup with the person**, one step at a time; it doesn't just print a wall of instructions. The rules it introduces live in `CLAUDE.md` and the other skills; never restate them here, point to them.

## Critical

- **Ask two things first:** their role (**QA** or **Dev**) and their AI tool (**Claude Code**, **GitHub Copilot**, or **both**). The tour and the first task depend on the answers. Their OS decides the shell syntax (PowerShell vs bash).
- **Check before installing.** Run the version checks in Step 1 and only install what's missing. Ask before any global install (Node, Claude Code CLI, Google Chrome).
- **Verify each step and report the real output.** A step is done when its check passes, not when its command ran. If a check fails, stop and fix it (see Troubleshooting) before moving on.
- **Never ask for, echo or commit credentials.** The person puts `GH_USER` / `GH_PASS` in their own `.env` or shell. Don't write the values for them.
- **Don't edit project files during onboarding.** Setup touches only `node_modules/`, browser caches and the person's shell. The first task (Step 7) goes through the normal 8-phase workflow, with its own approval.

## Step 1 — Prerequisites

| Tool | Check | Need | If missing |
|------|-------|------|------------|
| Node.js | `node --version` | LTS, 20.12 or newer (`playwright.config.ts` uses `process.loadEnvFile`; the repo is developed on 24) | <https://nodejs.org> or `nvm install --lts` |
| npm | `npm --version` | comes with Node | — |
| Git | `git --version` | any recent | <https://git-scm.com> |
| VS Code | `code --version` | recommended editor (Claude Code extension and Copilot both run there) | <https://code.visualstudio.com> |
| Google Chrome | — | only for the Booking spec (`channel: 'chrome'`) | Step 3 installs it via Playwright |

## Step 2 — Clone and install

```bash
git clone https://github.com/kesirasw/LatteQ.git
cd LatteQ
npm ci                 # exact versions from package-lock.json (use npm install only if you are changing dependencies)
```

Check: `node_modules/@playwright/test` exists and `npm ci` printed no `ERR!`.

## Step 3 — Browsers

```bash
npx playwright install chromium   # used by most specs
npx playwright install chrome     # branded Chrome for the Booking spec; skip if Chrome is already installed
```

On Linux CI or a fresh container add `--with-deps` to pull system libraries.

## Step 4 — Optional credentials

Only `tests/practice/07_auth_storageState.spec.ts` needs them; it skips itself with a reason when they're missing. Toolshop tests register their own customer, so they need nothing.

| Variable | Used by | Notes |
|----------|---------|-------|
| `GH_USER`, `GH_PASS` | GitHub login spec | A GitHub account **without 2FA**. Read in `data/env.ts` only. |
| `*_URL` (e.g. `TOOLSHOP_URL`) | all specs | Optional overrides to point a site at another environment. Defaults are in `data/env.ts`. |

Easiest: copy `.env.example` to `.env` (git-ignored) and fill it in; `playwright.config.ts` loads it on every run. Variables already set in the shell win over `.env`, which is how CI overrides them:

```powershell
Copy-Item .env.example .env                                  # PowerShell
$env:GH_USER = 'your-user'; $env:GH_PASS = 'your-password'   # or: shell only, current session
```

```bash
cp .env.example .env                                         # bash/zsh
export GH_USER='your-user' GH_PASS='your-password'            # or: shell only, current session
```

The saved login lands in `.auth/` (git-ignored). Delete `.auth/state.json` to log in again.

## Step 5 — Prove the setup

```bash
npm run verify                                                  # type-check + ESLint + Prettier: must be clean
npx playwright test tests/practice/01_tables_datatables.spec.ts # fast, stable smoke spec
npx playwright show-report                                      # open the HTML report
```

Pass criteria: `verify` exits 0 and the DataTables spec is green. Then optionally:

| Command | Expect |
|---------|--------|
| `npm run test:smoke` | `@smoke` tests pass |
| `npm run test:api` | Toolshop API tests pass (public demo, needs internet) |
| `npx playwright test --project=toolshop` | Toolshop UI suite, 2 workers by design (shared demo, KB §14); takes several minutes |
| `npm test` | everything; third-party sites (Booking, GitHub) can be flaky — check `docs/TEST_FIXES_KNOWLEDGE_BASE.md` before assuming your setup is wrong |

## Step 6 — Tour of the AI setup

Start with the shared picture, then the tool they chose.

### What every AI tool here follows

1. **Constitution:** `CLAUDE.md` (MUST / SHOULD / WON'T). Copilot gets the same rules, shortened, in `.github/copilot-instructions.md`.
2. **Skills:** `.claude/skills/<name>/SKILL.md`, one per job. The Skills Index in `CLAUDE.md` lists when each one applies.
3. **Context folders the AI reads instead of guessing:** `ui-context/<site>/MAP.md` (locators, flows, quirks), `api-context/<site>/` (OpenAPI + inventory), `test-plans/<site>/` (plain-English cases).
4. **Workflow:** classify → route → context → **proposal with a 1–10 confidence score** → *you approve* → apply → verify → report (`ai-native-workflow`). The person's job at the gate is to read the Scope and Unknowns before saying yes.
5. **Exploration:** chrome-devtools CLI only (`npm run ui:cdt`); never Playwright MCP or codegen.

### Track A — Claude Code

| Step | How |
|------|-----|
| Install | VS Code extension "Claude Code", or the CLI: `npm install -g @anthropic-ai/claude-code`, then run `claude` in the repo root |
| Open the repo root | `CLAUDE.md` loads automatically; skills in `.claude/skills/` are discovered automatically |
| Invoke a skill | Just describe the task ("add a test that DataTables paginates to page 2") — the matching skill loads itself. Or name it: `/ui-context`, `/test-planning`, `/api-testing`, `/debugging`, `/pr-reviewer`, `/onboarding` |
| Write-time guard | `.claude/settings.json` runs `.claude/hooks/enforce-constitution.mjs` before every edit; it blocks hard waits, XPath, `any`, `.only`, literal URLs and similar. If it blocks, the change is wrong — fix the change |
| Approve / reject | Answer the proposal block. "Rework: <gap>" sends it back to context-gathering |
| Commits | Claude asks before committing; it never pushes unless asked |

### Track B — GitHub Copilot (VS Code)

| Step | How |
|------|-----|
| Install | VS Code extensions "GitHub Copilot" + "GitHub Copilot Chat", signed in with a Copilot-enabled account |
| Repo-wide rules | `.github/copilot-instructions.md` is applied to every chat request automatically (setting `github.copilot.chat.codeGeneration.useInstructionFiles`, on by default) |
| Path-scoped rules | `.github/instructions/*.instructions.md` attach themselves by `applyTo` glob — e.g. `tests.instructions.md` for `tests/**/*.ts`, `page-objects.instructions.md` for `pages/**` |
| Prompt files | In Chat type `/pr-reviewer` or `/onboarding` (files in `.github/prompts/`). Enable `chat.promptFiles` if they don't appear |
| Full skill detail | Copilot doesn't load `.claude/skills/` by itself. Attach the one you need: `#file:.claude/skills/ui-context/SKILL.md`. Use **Agent** mode so it can run `npm run verify` and the tests |
| Copilot coding agent (github.com) | Assign an issue to Copilot; it sets up its environment from `.github/workflows/copilot-setup-steps.yml` and opens a PR. Review that PR with `/pr-reviewer` like any other |
| Not covered by Copilot | The write-time hook is Claude-only. ESLint (`npm run lint`) is the guard for Copilot edits, so always run `npm run verify` before pushing |

### Prompts that work well (either tool)

- "Read `ui-context/datatables/MAP.md` and add a test that pagination moves to page 2."
- "Write a test plan for <site>" → crawl if no map, then `test-planning`.
- "Automate `test-plans/toolshop/test-cases/03-shopping-cart.md` case 4."
- "`tests/practice/03_spa_github.spec.ts` is failing, here's the error: …" → `debugging`.
- "Review my changes before I open a PR" → `pr-reviewer`.

## Step 7 — First task by role

Suggest one; run it through the normal 8-phase workflow (proposal → approval → verify).

| Role | First task | Skills it exercises | Done when |
|------|------------|---------------------|-----------|
| **QA** | Read `test-plans/toolshop/test-plan.md` and one `test-cases/` file, then pick a case and trace it to its spec in `tests/toolshop/`. Then ask the AI to add one new case for a DataTables behaviour that's already in `ui-context/datatables/MAP.md` | `ui-context`, `test-planning`, `test-standards` | New test green, `verify` clean |
| **Dev** | Extend a page object with one intent-level method (e.g. DataTables page size) using map locators, register nothing new unless needed, and add a spec for it. Or add one negative API test from `test-plans/toolshop/api/` | `page-objects`, `selectors`, `fixtures` / `api-testing` | Test green, `verify` clean, `/pr-reviewer` has no Blockers |

Then point them at the 14-day practice path in `README.md`.

## Daily loop (cheat sheet)

```bash
git pull
npm ci                                    # when package-lock.json changed
# ...work with the AI: map first → proposal → approve → apply...
npm run verify
npx playwright test <changed spec>
npx playwright show-report                # on failure: open the trace
# /pr-reviewer before opening a PR
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npx` fails inside an agent shell on Windows (exit 127 / -4071) | Call the tools through node: `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/eslint/bin/eslint.js .`, `node node_modules/prettier/bin/prettier.cjs --check .`, `node node_modules/@playwright/test/cli.js test <file>` |
| `Executable doesn't exist at …chromium…` | Step 3 was skipped: `npx playwright install chromium` |
| Booking spec: "Chromium distribution 'chrome' is not found" | `npx playwright install chrome` |
| Auth spec skipped | Expected without `GH_USER` / `GH_PASS` (Step 4) |
| `npm run verify` fails on a fresh clone | `npm run format` / `npm run lint:fix` only if the person is about to change those files; otherwise report it — `main` is expected to be clean |
| Toolshop "Login failed" / blank pages | Too many workers on the shared demo; use `--project=toolshop` (2 workers). KB §14 |
| Claude says the hook blocked an edit | The edit adds a WON'T item from `CLAUDE.md`; fix the code, don't bypass |
| Copilot ignores the rules | Check the instructions setting (Track B), and that the workspace root is the repo root (not a parent folder) |
| A real-site test fails | `docs/TEST_FIXES_KNOWLEDGE_BASE.md`, then the site's `MAP.md` Quirks, then load `debugging` |

## Report

Finish with a short checklist: prerequisites ✓/✗, install ✓/✗, browsers ✓/✗, `verify` result, smoke spec result (pass/fail counts), AI tool configured, first task chosen. List anything skipped and why.
