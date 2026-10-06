---
mode: agent
description: Review the current LatteQ branch against main using the project rules
---

Follow `.claude/skills/pr-reviewer/SKILL.md` exactly:

1. Collect the diff: `git fetch origin main`, `git diff --name-status origin/main...HEAD`, `git diff origin/main...HEAD` (plus uncommitted changes if I say "my changes").
2. Route each file to its rules (`.github/instructions/*.instructions.md` and the matching `.claude/skills/*`).
3. Scan added lines for: `waitForTimeout`, XPath, `.catch(() => {})`, `force: true`, `@playwright/test` imports in specs, `test.only`, `any`, `@ts-ignore`, literal URLs outside `data/env.ts`, unexplained `.first()`/`.nth()`, `test.fail(` without `DEF-NNN`, `.or(` used as a fallback locator.
4. Review judgement items: outcome assertions, intent-level page methods, fixture registration, knowledge-base entries for real-site fixes, changed expectations (assertion values, expected text/status, plan results) justified by an oracle and not by "the site does this now" (Blocker otherwise), `docs/DEFECTS.md` rows for new `test.fail`, `MAP.md` rows for healed locators.
5. Run `npm run verify` and the affected specs.
6. Report as Blockers / Should fix / Nits / Good, each finding with `file:line`, the rule, and a concrete fix. Do not edit files unless I ask.
