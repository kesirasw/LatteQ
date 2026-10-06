# 005. Toolshop: one fresh customer per test, at most 2 workers

- **Status:** Accepted
- **Date:** 2026-10-05
- **Rules it affects:** `playwright.config.ts` (`toolshop` project), the `toolshopCustomer` fixture; KB §12, §14

## Context

practicesoftwaretesting.com is a public, shared demo. Shared accounts collide between parallel tests and with other users, and with 4+ workers the demo returns "Login failed" and blank pages.

## Decision

Each test registers its own customer through the `toolshopCustomer` fixture. The `toolshop` Playwright project runs with `workers: 2`; other sites keep full parallelism. No retries or longer timeouts were added to compensate.

## Alternatives rejected

- **Shared demo accounts from the site's docs:** state leaks between tests and runs.
- **More retries / longer timeouts:** they hide load failures instead of avoiding them.

## Consequences

The Toolshop suite takes several minutes. Orders only succeed with the shop's postcode-lookup address (KB §12).
