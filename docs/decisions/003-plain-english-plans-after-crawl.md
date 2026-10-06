# 003. Test plans are plain English, written after the crawl

- **Status:** Accepted
- **Date:** 2026-10-04
- **Rules it affects:** skills `test-planning`, `api-test-planning`; `test-plans/`

## Context

Plans written before seeing the site were guesses. Plans full of locators or code couldn't be reviewed by non-developers.

## Decision

Crawl first (`ui-context`), then write `test-plans/<site>/test-plan.md` and `test-cases/NN-<area>.md` in plain English: no locators, no code, no status codes (API plans may name the endpoint and the expected response). Each case has a basis label (seen live / documented / needs confirming).

## Alternatives rejected

- **Plans in a `specs/` folder next to the code, or as code comments:** QA and product people can't review them.

## Consequences

Every automated test traces back to a case ID (`TC-…`). Expected results state the *correct* behaviour, so a plan is also an oracle for the bug oracle ([006](006-bug-oracle-and-assisted-healing.md)).
