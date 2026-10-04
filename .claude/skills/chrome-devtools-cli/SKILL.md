---
name: chrome-devtools-cli
description: How to drive a real headless Chrome with the chrome-devtools CLI (from the chrome-devtools-mcp devDependency) to crawl a page for LatteQ — start/stop the daemon with the project's privacy and cert flags, open pages, take accessibility snapshots (default vs --verbose), act on elements by snapshot uid (click, fill, hover, press_key), read network/console, use evaluate_script for iframes and data-testid, and save commit-safe snapshots into ui-context/. Load whenever the ui-context skill says a crawl is needed, or the user asks to inspect a live page. This is the ONLY approved exploration tool — never Playwright MCP, playwright codegen, or ad-hoc Playwright scripts.
---

# chrome-devtools CLI

Tool reference for crawling. *When* to crawl and what to record is owned by `ui-context`; this skill is just how to operate the tool.

## Critical

- **This is the only exploration tool.** No Playwright MCP (`browser_*`, `planner_*`, `generator_*`), no `playwright codegen`, no throwaway Playwright scripts for discovery.
- **uids are session-only.** `uid=12_34` is valid only until the daemon restarts or the node re-renders. Never write a uid into a page object, spec or map locator.
- **Always start with the project flags** (below): privacy flags off-by-default telemetry, `--acceptInsecureCerts` to mirror `ignoreHTTPSErrors: true`.
- **Save snapshots through `npm run ui:snap`**, not raw `--filePath` into the repo — it strips session tokens from URLs and stamps provenance.
- **Stop the daemon when done** (`stop`), or it keeps Chrome running in the background.
- **If the page shows a bot wall / captcha / login wall, stop and tell the user.** Don't try to defeat it.

## Invocation

The CLI is `chrome-devtools` from devDependency `chrome-devtools-mcp` (pinned). Run it as:

```bash
npm run ui:cdt -- <command> [args]                                  # preferred
node node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools.js <command> [args]   # if npx/npm-run is unavailable in the shell
```

Every command takes `--help`. Output is markdown by default (`--output-format json` available).

## Session lifecycle

```bash
npm run ui:cdt -- start --headless --isolated --acceptInsecureCerts --no-usage-statistics --no-performance-crux
npm run ui:cdt -- new_page "https://example.com/"     # prints the page list; note your pageId (usually 2)
npm run ui:cdt -- list_pages                          # find pageId again; [selected] marks the current one
npm run ui:cdt -- status                              # is the daemon up, with which flags
npm run ui:cdt -- stop
```

- `--isolated`: fresh temp profile (no cookies from your real browser).
- `--no-usage-statistics --no-performance-crux`: by default the tool sends usage stats to Google and trace URLs to the CrUX API — keep both off.
- `--acceptInsecureCerts`: needed for uitestingplayground.com (`ERR_CERT_COMMON_NAME_INVALID`).

## Navigate

```bash
npm run ui:cdt -- navigate_page <pageId> --type url --url "https://…"
npm run ui:cdt -- navigate_page <pageId> --type reload [--ignoreCache]
npm run ui:cdt -- navigate_page <pageId> --type back
```

## Snapshot

```bash
npm run ui:cdt -- take_snapshot <pageId>                 # to stdout (quick look)
npm run ui:snap -- <site> <state> [--page <pageId>]      # save to ui-context/<site>/<state>.snapshot.txt (sanitized)
npm run ui:snap -- <site> <state> --verbose              # full tree → <state>.verbose.snapshot.txt
npm run ui:snap -- --sanitize <file...>                  # clean a file captured by hand with --filePath
```

Snapshot line format: `uid=<id> <role> "<accessible name>" <attributes>` — indentation is tree depth.

| Need | Use |
|---|---|
| Buttons, links, inputs, headings, landmarks, dialogs, listbox/options | default snapshot |
| Table rows, cells, `columnheader`, `aria-sort`, generic containers | `--verbose` |
| Elements inside an `Iframe` node | not in any snapshot → `evaluate_script` (below) |
| `data-testid`, CSS classes, ids | not in snapshots → `evaluate_script` |

- `--filePath` always writes `.txt`, whatever extension you pass.
- While a **modal** is open (dialog `modal`, MUI listbox portal) the snapshot contains **only** the modal subtree.

## Act on elements (by uid from the latest snapshot)

```bash
npm run ui:cdt -- click <pageId> <uid> [--includeSnapshot]
npm run ui:cdt -- fill <pageId> <uid> "text"          # inputs, textareas, native <select>
npm run ui:cdt -- hover <pageId> <uid>
npm run ui:cdt -- press_key <pageId> "Enter"          # or "Control+A", "Escape"
npm run ui:cdt -- type_text <pageId> "text"           # into the focused element (for inputs that ignore fill)
npm run ui:cdt -- handle_dialog <pageId> accept|dismiss
```

Take a fresh snapshot after each action — new nodes get a new uid prefix (`10_*`), and the diff between snapshots is the observable outcome you'll assert on.

## Inspect

```bash
npm run ui:cdt -- list_network_requests <pageId>      # find the XHR a test can wait on
npm run ui:cdt -- get_network_request <pageId> --reqid <id>
npm run ui:cdt -- list_console_messages <pageId>      # CORS/CSP errors explain "element never renders"
npm run ui:cdt -- take_screenshot <pageId>            # only when a human needs to see it
```

## evaluate_script (iframes, test ids)

`--pageId` is a **flag** here (not positional):

```bash
# list data-testid values in a region
npm run ui:cdt -- evaluate_script --pageId 2 "() => [...document.querySelectorAll('[data-testid]')].slice(0,50).map(e => e.dataset.testid)"

# read accessible names inside a same-origin iframe (the snapshot shows it empty)
npm run ui:cdt -- evaluate_script --pageId 2 "() => { const d = document.querySelector('iframe[title=\"<title>\"]').contentDocument; return [...d.querySelectorAll('[role][aria-label]')].slice(0,40).map(e => e.getAttribute('role') + ' | ' + e.getAttribute('aria-label')); }"
```

Cross-origin iframes can't be read this way — record their locators as `run`-verified in the map.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Privacy error` / `ERR_CERT_*` RootWebArea | daemon started without `--acceptInsecureCerts` → `stop`, restart with project flags |
| `Element uid "…" not found` | stale uid (page re-rendered or daemon restarted) → take a new snapshot |
| `specify either a pageId or a serviceWorkerId` | `evaluate_script` needs `--pageId <n>` |
| Snapshot is only a dialog | a modal is open → dismiss it, snapshot again; record the modal in the map |
| Element never renders | `list_console_messages` (CORS/CSP blocks happen in real Chrome), consent banner not dismissed |
| Different UI than the tests see | real Chrome vs Playwright Chromium, locale, A/B test → record as a variant in the map |
