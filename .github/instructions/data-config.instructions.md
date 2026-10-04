---
applyTo: "{data/**/*.ts,playwright.config.ts}"
---

# Data & config (full rules: `.claude/skills/data-config/SKILL.md`)

- `ENV` in `data/env.ts` is the single source for site URLs, credentials, shared keywords and timeout constants.
- New URLs: `EXAMPLE_URL: process.env.EXAMPLE_URL || 'https://…'` so CI can override.
- Credentials only from `process.env`; never commit values. Tests needing a missing credential use `test.skip(!ENV.X, 'X not set')`.
- Don't invent env-var names — propose them first.
- Keep config defaults (timeouts, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `ignoreHTTPSErrors: true`). Raising timeouts is never a flakiness fix.
- Auth: a `setup` project writes `.auth/state.json` via `utils/auth.ts`; dependent projects use `storageState`.
- Config changes affect every test — call them out and run the full suite.
