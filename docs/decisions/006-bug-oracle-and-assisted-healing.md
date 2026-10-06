# 006. Bug oracle + assisted healing; no runtime self-healing

- **Status:** Accepted
- **Date:** 2026-10-06
- **Rules it affects:** CLAUDE.md MUST #12 and WON'T rows; skill `debugging` (Bug oracle, Assisted healing); `docs/DEFECTS.md`; `npm run heal:suggest`; hook rule `expected-failure-without-defect`

## Context

An AI asked to "fix the red test" tends to make it green: change the expected text, or point the locator at whatever is there now. That turns product bugs into passing tests. Runtime self-healing tools (fallback locators, an AI choosing a new element mid-run) do the same thing automatically.

## Decision

1. **Bug oracle:** before changing a failing test, decide whether it's a test bug, the environment, an intended change or a product defect, using an order of authority: requirement → contract → test plan → heuristics. The site's current behaviour is never proof. Defects go to `docs/DEFECTS.md` and stay red by design with `test.fail(true, 'DEF-NNN: …')`.
2. **Assisted healing:** an agent repairs broken locators, with a human gate: `heal:suggest` (candidates from the failure snapshot) → confirm with a CLI snapshot → oracle check on any changed visible text → update the map and the page object → approval.

## Alternatives rejected

- **Runtime self-healing (fallback locator chains, AI picking elements during the run):** a renamed "Place order" button might be the bug. Healing at runtime hides it and makes failures hard to reproduce.
- **No healing support:** every UI change becomes a full manual investigation.

## Consequences

Healing is never silent: every heal is a reviewed diff in `pages/` and `MAP.md`. Defects have IDs, and a fixed defect announces itself because its `test.fail` test starts passing.
