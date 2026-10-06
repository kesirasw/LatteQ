# 008. No confidence score or approval step before applying changes

- **Status:** Accepted
- **Date:** 2026-10-06
- **Rules it affects:** `CLAUDE.md` Workflow Entry Point and MUST #13; `ai-native-workflow` (8 phases → 6); `onboarding`, `debugging` §5, `ui-context`, `data-config`, `api-test-planning`; `.github/copilot-instructions.md`

## Context

The workflow inherited from agentic-playwright had two steps between gathering context and applying a change: a written proposal with a 1–10 confidence score (Phase 4), then waiting for the user to approve it (Phase 5). Both existed only as instructions. Nothing checked that they happened, and in practice the assistant regularly went straight from context to editing, so the docs promised a gate that wasn't there.

## Decision

Drop the proposal, confidence score and approval wait. The workflow is now classify → route → context → apply → verify → report. The assistant still asks when an input is missing (URL, flow, expected result, credentials), still asks before committing or pushing, and still needs approval to keep a healed locator (`debugging` §5, decision 006). One human checkpoint is kept on purpose: after a crawl, the test plan and test cases are reviewed and validated by a person, and automation starts only from a plan marked **Approved** (`CLAUDE.md` MUST #14).

## Alternatives rejected

- **Enforce the gate:** start every Claude Code session in plan mode and add a hook on leaving plan mode that rejects a plan without the proposal block or with confidence below 5. It works in Claude Code but has no Copilot equivalent, and it adds a stop to every task, including small ones.
- **Keep it as an instruction only:** documents a control that isn't applied, which is worse than not having it.

## Consequences

- Review moves to the end: people read the report (files changed, context used, test result, open unknowns) and the diff before it is committed.
- The write-time hook (`enforce-constitution.mjs`) and ESLint remain the automatic checks on code.
- Locator healing keeps its approval step because it changes what a test checks against; decision 006 still applies.
- Plan review is the one checkpoint before automation: a plan is cheap to correct, while a wrong expected result built into specs is expensive to find later. The plan's Status (**Draft** → **Approved**) records that the review happened.
