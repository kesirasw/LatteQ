# Decision Records

Short records of **why** LatteQ works the way it does: the choices a new teammate, Claude or Copilot might otherwise "fix". Rules themselves live in `CLAUDE.md` and the skills; these files hold the reasoning and the rejected alternatives.

**Add one when** a change picks between real alternatives, reverses an earlier choice, or someone asks "why don't we use X?" twice. Copy [000-template.md](000-template.md), take the next number, and add a row below. Don't edit an old decision to reverse it: write a new one and set the old one's status to `Superseded by NNN`.

| # | Decision | Status | Date |
|---|----------|--------|------|
| [001](001-chrome-devtools-cli-for-exploration.md) | UI exploration uses the chrome-devtools CLI only | Accepted | 2026-10-04 |
| [002](002-keep-existing-layout.md) | Keep LatteQ's own layout when adopting the agentic workflow | Accepted (partly superseded by 007) | 2026-10-04 |
| [003](003-plain-english-plans-after-crawl.md) | Test plans are plain English, written after the crawl | Accepted | 2026-10-04 |
| [004](004-contract-first-zod.md) | API responses are validated with strict Zod schemas from the OpenAPI contract | Accepted | 2026-10-04 |
| [005](005-toolshop-isolation-and-load.md) | Toolshop: one fresh customer per test, at most 2 workers | Accepted | 2026-10-05 |
| [006](006-bug-oracle-and-assisted-healing.md) | Bug oracle + assisted healing; no runtime self-healing | Accepted | 2026-10-06 |
| [007](007-testdata-and-env-config.md) | `data/` → `testdata/`; URLs from `.env` via `config/` | Accepted, not yet implemented | 2026-10-06 |
| [008](008-no-confidence-gate.md) | No confidence score or approval step before applying changes | Accepted | 2026-10-06 |
