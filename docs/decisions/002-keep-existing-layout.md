# 002. Keep LatteQ's own layout when adopting the agentic workflow

- **Status:** Accepted; the `data/` part is superseded by [007](007-testdata-and-env-config.md)
- **Date:** 2026-10-04
- **Rules it affects:** CLAUDE.md Project Map; every skill's paths

## Context

The AI workflow (skills, confidence gate, verify loop) is modelled on github.com/idavidov13/agentic-playwright, which uses its own folders (`enums/`, `test-data/`, `helpers/`).

## Decision

Adapt the skills to LatteQ's existing layout (`pages/`, `utils/`, `fixtures/test.ts`, `data/env.ts`) instead of restructuring the repo to match the source project.

## Alternatives rejected

- **Restructure to match agentic-playwright:** large churn for no change in behaviour; every spec and doc would move.

## Consequences

Skills borrowed from that project are rewritten for LatteQ's paths (attribution in `docs/THIRD-PARTY-NOTICES.md`). Don't propose a restructure unless asked; 007 is such a request.
