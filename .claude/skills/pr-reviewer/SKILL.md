---
name: pr-reviewer
description: Review a LatteQ branch or diff against the Constitution and skills — collect the diff vs main, route each changed file to the owning skill (pages → page-objects/selectors, specs → test-standards, fixtures/utils → fixtures, env/config → data-config), run npm run verify and the affected tests, and produce a tiered report (Blocker / Should fix / Nit). Load when the user asks to review a branch, PR, diff or "my changes" before merging.
---

# PR Reviewer

## Critical

- **Review the diff, not the whole repo.** Pre-existing issues in untouched lines are out of scope (mention at most one line at the end).
- **Every finding cites `file:line`, the rule (CLAUDE.md MUST/WON'T # or skill name) and a concrete fix.**
- **Run the checks; don't assume.** Report actual `npm run verify` and test output.
- **Read-only by default.** Don't edit files unless the user asks you to apply fixes.

## Steps

1. **Collect**
   ```bash
   git fetch origin main
   git diff --name-status origin/main...HEAD
   git diff origin/main...HEAD
   ```
   Include uncommitted changes (`git diff`, `git status`) if the user says "my changes".
2. **Route** each file and re-read that skill's Critical block:
   | Path | Skills |
   |------|--------|
   | `pages/**` | `page-objects`, `selectors` |
   | `tests/**/*.spec.ts` | `test-standards` |
   | `fixtures/**`, `utils/**` | `fixtures` |
   | `data/**`, `playwright.config.ts`, `.env*` | `data-config` |
   | `TEST_FIXES_KNOWLEDGE_BASE.md` | `debugging` (format) |
   | `.claude/**`, `.github/**`, `CLAUDE.md` | consistency between Claude and Copilot rule sets |
3. **Mechanical scan** of added lines (`git diff -U0 origin/main...HEAD | grep '^+'`): `waitForTimeout`, `xpath=` / `'//`, `.catch(() => {})`, `force: true`, `from '@playwright/test'` in specs, `test.only`, `: any`, `@ts-ignore`, `https?://` literals outside `data/env.ts`, `.first()`/`.nth(` without intent.
4. **Judgement review:** locators from snapshots? outcome assertions present? page-object methods intent-level? new page registered in fixtures? knowledge-base entry for real-site fixes?
5. **Verify:** `npm run verify` and `npx playwright test <changed specs + specs using changed pages>`.
6. **Report.**

## Report format

```
## Review: <branch> → main
Checks: verify ✅/❌ · tests <passed>/<total> (<failed names>)

### Blockers (must fix before merge)
- path/file.ts:42 — <issue> (MUST #5) → <fix>

### Should fix
- …

### Nits
- …

### Good
- <one or two things done well>
```

Blockers = any CLAUDE.md MUST/WON'T violation, failing verify or tests. Should fix = skill guidance not followed. Nits = naming/style that lint doesn't catch.
