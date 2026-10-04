---
name: explore
description: Exploration-first rules for LatteQ — how to inspect a live page with the Playwright test MCP server (browser_snapshot, browser_navigate, generate_locator, planner/generator tools, seed file) before writing any locator, page object, test or test plan. Load before creating or changing anything in pages/ or tests/, when the user asks for a test plan in specs/, or when a locator needs to be verified against the real page.
---

# Explore

Every locator, label, button name and message string in LatteQ must come from the **live page**, not memory. This skill says how to get that evidence.

## Critical

- **Snapshot before you write.** No locator goes into `pages/` until you have seen the element in an accessibility snapshot (or `browser_generate_locator` output) in this session.
- **Use the `playwright-test` MCP server.** It is configured in `.mcp.json` (Claude Code) and `.vscode/mcp.json` (Copilot) and runs `npx playwright run-test-mcp-server`. Don't substitute `playwright codegen` or guesses.
- **If the page won't load, stop.** Cert error, captcha, "unusual traffic", login wall, region redirect → report what you saw and ask the user. Don't invent locators "that are probably there".
- **Read before you explore.** Check `pages/` for an existing page object for the site and `TEST_FIXES_KNOWLEDGE_BASE.md` for known traps (overlays, SSL, multiple headings, late rendering).

## Steps

1. **Read existing code.** `pages/<Site>Page.ts`, the matching spec in `tests/practice/`, and the site's section of `TEST_FIXES_KNOWLEDGE_BASE.md`.
2. **Open the page.** `browser_navigate` to the URL from `ENV` in `data/env.ts` (ask if it isn't there yet — see `data-config`).
3. **Handle blockers first.** Cookie/consent banners, sign-in modals and region pop-ups: snapshot, note their role/name, and plan a dismiss step in the page object.
4. **Snapshot the region of interest.** `browser_snapshot`. Record for each element you'll use: role, accessible name, label/placeholder, whether it's unique.
5. **Walk the flow.** Perform the user's flow with `browser_click` / `browser_type` / `browser_select_option`, snapshotting after each step to see what actually changes (URL, heading, toast, row count). The change you observe is your assertion.
6. **Capture network if the UI is unreliable.** `browser_network_requests` — note the request URL fragment the page fetches, so the test can wait with `Network.waitForResponseContains` instead of sleeping.
7. **Confirm locators.** For anything ambiguous use `browser_generate_locator`; if it returns CSS or `.nth()`, look for a role/label alternative before accepting it (see `selectors`).
8. **Summarise evidence** in the Phase 4 proposal: the locators you'll use and the observed outcome you'll assert.

## Test plans (`specs/`)

When the user asks for a plan rather than code:

- Use `planner_setup_page` with `tests/seed.spec.ts`, explore, then `planner_save_plan` to `specs/<area>.md`.
- Each scenario: title, preconditions, numbered steps, expected result per step. Mark scenarios that hit bot walls or need credentials.
- Generation from a plan uses `generator_setup_page` → steps → `generator_write_test`, then move the result into LatteQ shape: imports from `fixtures/test.ts`, interactions inside a page object, not raw `page.*` calls in the spec (see `test-standards`).

## Copilot equivalents

The Copilot agents in `.github/agents/` (`playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer`) use the same MCP server. Their output must still meet CLAUDE.md / `.github/copilot-instructions.md`.
