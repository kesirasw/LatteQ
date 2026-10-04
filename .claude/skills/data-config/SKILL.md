---
name: data-config
description: Configuration and test-data rules for LatteQ — data/env.ts (ENV object) as the single source for base URLs, credentials via process.env, shared keywords and timeout constants; .env handling; and playwright.config.ts changes (projects, baseURL, storageState setup project, timeouts, reporters). Load when adding a site URL, env var, credential, keyword or timeout, or when editing playwright.config.ts.
---

# Data & Config

## Critical

- **`ENV` in `data/env.ts` is the single source** for site URLs, credentials, shared keywords and timeout constants. Pages and specs import `ENV`; they never contain literal URLs.
- **Credentials only via `process.env`**, read in `data/env.ts`. Never commit real values. `.env` is git-ignored.
- **Don't invent env-var names.** Check `data/env.ts`; if a new one is needed, propose the name in Phase 4.
- **A test needing a missing credential skips with a reason** — `test.skip(!ENV.GH_USER, 'GH_USER not set')` — it doesn't fail mysteriously or log in with blanks.
- **Config changes are global.** Any edit to `playwright.config.ts` affects every test — call it out in the proposal and run the full suite afterwards.

## Adding a site

```ts
// data/env.ts
export const ENV = {
  // ...
  EXAMPLE_URL: process.env.EXAMPLE_URL || 'https://example.com',
  TEST_KEYWORDS: {
    // ...
    example: 'widgets',
  },
};
```

Override with `process.env.*` so CI can point at another environment without code changes.

## Timeouts

- Defaults live in `playwright.config.ts` (test 60s, expect 10s, action 15s, navigation 30s). Leave them alone.
- If one site legitimately needs longer, pass `{ timeout: ENV.LONG_TIMEOUT }` on that one assertion with a comment. No magic numbers.
- Raising a timeout is never a fix for a flaky wait — see `debugging`.

## playwright.config.ts patterns

- **Auth:** add a `setup` project matching `/.*\.setup\.ts/` that logs in and calls `saveStorageState`, then give dependent projects `dependencies: ['setup']` and `use: { storageState: AUTH_STATE_PATH }`.
- **`ignoreHTTPSErrors: true`** is already on globally for UITP's certificate (knowledge base §4). Don't add per-test workarounds.
- **New browser projects** (Firefox/WebKit) — propose first; the practice sites behave differently per engine.
- **Reporters:** `list` + `html` (never auto-open). Keep `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` — `debugging` depends on them.
