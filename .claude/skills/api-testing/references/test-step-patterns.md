# Forbidden patterns: no `test.step`, and empty-body-only validation

From `api-testing/SKILL.md` Phases 4 and 6. Adapted from agentic-playwright (MIT).

## Forbidden: several API calls without `test.step`

```ts
// FORBIDDEN
test('Toolshop API: customer reads profile @api', async ({ apiRequest }) => {
  const login = await apiRequest<LoginResponse>({ method: 'POST', url: ToolshopApi.LOGIN, baseUrl: ENV.TOOLSHOP_API_URL, body: creds });
  expect(login.status).toBe(200);
  const me = await apiRequest<CurrentUser>({ method: 'GET', url: ToolshopApi.CURRENT_USER, baseUrl: ENV.TOOLSHOP_API_URL, headers: login.body.access_token });
  expect(me.status).toBe(200);
});
```

Why: the report shows one block. When it fails, you have to read the assertions to know whether login or the profile call broke.

**Fix:** wrap each call in `test.step('<Verb> <thing> via <METHOD> <path>', async () => { … })`, as in SKILL.md Phase 4.

## Forbidden: only an empty-body test

```ts
// FORBIDDEN as the only validation test
test('Toolshop API: login rejects an empty body @api', async ({ apiRequest }) => {
  const { status } = await apiRequest({ method: 'POST', url: ToolshopApi.LOGIN, baseUrl: ENV.TOOLSHOP_API_URL, body: {} });
  expect(status).toBe(422);
});
// Missing: per-field omission and per-field wrong-type loops
```

**Fix:** keep it, and add the two loops from `negative-testing.md`.
