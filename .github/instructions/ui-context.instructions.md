---
applyTo: "ui-context/**"
---

# UI context maps (full rules: `.claude/skills/ui-context/SKILL.md`, CLI: `.claude/skills/chrome-devtools-cli/SKILL.md`)

- One folder per site (fixture name). `MAP.md` sections: header table (Base URL, Captured, Snapshots, Used by, Last verified by run) · Quirks · States & flows · Locators · Data (optional) · Gaps.
- Locator rows are **Playwright locators**, never snapshot uids. The Source column is `cdt`, `cdt (verbose)`, `run`, `cdt + run` or `not verified`.
- Capture snapshots only with `npm run ui:snap -- <site> <state> [--verbose]`, which strips session tokens from URLs. Never commit raw `--filePath` output.
- Crawl only with the chrome-devtools CLI started with `--headless --isolated --acceptInsecureCerts --no-usage-statistics --no-performance-crux`.
- Mapping: `image` → `img`; `Iframe "T"` → `getByTitle('T').contentFrame()`; add `exact: true` when another same-role name contains this one; scope duplicates to a named landmark.
- Maps older than 30 days, or contradicted by a test run, get the affected state refreshed.
