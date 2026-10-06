---
applyTo: "test-plans/**"
---

# UI test plans and test cases (full rules: `.claude/skills/test-planning/SKILL.md`)

> API plans under `test-plans/<site>/api/` follow `api-test-plans.instructions.md` instead (status codes are allowed there in the Expected response field).

- Write only after the site is crawled. Plan from `ui-context/<site>/MAP.md`, never from memory.
- Layout: `test-plans/<site>/test-plan.md` + `test-plans/<site>/test-cases/NN-<feature-area>.md` (lowercase, hyphenated, numbered in journey order). Keep `test-plans/README.md` up to date.
- **Plain English only:** no locators, `data-test`, code, status codes or JSON. Use the site's own words for buttons and messages, in bold. Steps start with a verb.
- Each case is a `### TC-<AREA>-<NN> — <title>` section with Priority (High/Medium/Low), Type, Before you start, Steps, Expected result, Basis, and Map reference (a flow step ID from the map).
- Basis is **Seen during exploration** or **Needs confirming**. Never present a guess as seen.
- Suspected defects: the expected result states the correct behaviour; the plan's "Questions and suspected defects" section records what was actually seen.
- Summary counts in `test-plan.md` are counted from the files, not estimated.
- **Review before automation.** When the plan and cases are written, leave Status as **Draft**, summarise them for the user and ask them to review and validate. Set Status to **Approved** (with **Reviewed by** name and date) only when they approve. Don't start automating in the same step.
