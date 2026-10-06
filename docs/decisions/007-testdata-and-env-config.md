# 007. `data/` → `testdata/`; URLs from `.env` via `config/`

- **Status:** Accepted, not yet implemented (waiting for the Toolshop API work in progress to land)
- **Date:** 2026-10-06
- **Rules it affects:** CLAUDE.md MUST #6 and Project Map; skill `data-config`; the write-time hook; every import of `data/*`

## Context

`data/env.ts` mixes environment configuration (base URLs with hardcoded fallbacks, credentials, timeouts) with test data. Most real-world frameworks keep environment values in `.env` and test data in its own folder.

## Decision

- `config/env.ts` reads every URL from `process.env` with **no hardcoded fallback**, and fails fast naming the missing variable. Credentials stay optional; timeouts stay here as constants.
- `.env.example` (committed) lists every URL; `.env` (git-ignored) is the real file, loaded by `playwright.config.ts`. CI copies `.env.example` or sets the variables.
- `config/api-endpoints.ts` holds API paths (configuration, not data).
- `testdata/` holds `toolshop-data.ts`, `toolshop-invalid-data.ts`, `invalid-values.ts`, and `keywords.ts` (was `ENV.TEST_KEYWORDS`).

## Alternatives rejected

- **Keep URL fallbacks in code:** a typo in `.env` silently tests the wrong environment.
- **API paths in `testdata/`:** they're contract configuration, not test inputs.

## Consequences

A fresh clone must run `cp .env.example .env` before tests run (covered by the `onboarding` skill and `copilot-setup-steps.yml`).
