# 001. UI exploration uses the chrome-devtools CLI only

- **Status:** Accepted (re-confirmed 2026-10-06 when playwright-cli was considered)
- **Date:** 2026-10-04
- **Rules it affects:** CLAUDE.md MUST #8 and the WON'T row on UI discovery; skills `ui-context`, `chrome-devtools-cli`; `.github/copilot-instructions.md`

## Context

AI agents need to see a page before writing locators. The options were Playwright MCP, Playwright codegen, Microsoft's playwright-cli, ad-hoc Playwright scripts, or the chrome-devtools CLI that ships with `chrome-devtools-mcp`. The owner's organisation already uses the chrome-devtools CLI.

## Decision

The chrome-devtools CLI is the only exploration tool. What it finds is saved to `ui-context/<site>/` (sanitized snapshots + `MAP.md`), so a page state is crawled once and reused by every agent and person.

## Alternatives rejected

- **Playwright MCP / Copilot Playwright agents:** a second, overlapping toolchain. They were removed (`.mcp.json`, `.github/agents/playwright-test-*`).
- **playwright-cli:** produces Playwright locators directly, but would mean two crawl tools for the same sites, maps that drift apart, and rewritten rules, for little that `npm run ui:map` doesn't already give.
- **codegen / ad-hoc scripts:** they record clicks, not knowledge; nothing reusable is saved.

## Consequences

Snapshots are turned into Playwright locators by `npm run ui:map`. Iframe contents need `evaluate_script` or a `run` verification. Same tool as the owner's organisation.
