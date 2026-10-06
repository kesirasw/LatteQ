---
applyTo: "{tests/api/**,fixtures/api/**,data/api-endpoints.ts,data/invalid-values.ts}"
---

# API tests (full rules: `.claude/skills/api-testing/SKILL.md`)

- **Contract first:** schemas and expected status codes come from the site's OpenAPI contract (Toolshop: `https://api.practicesoftwaretesting.com/docs?api-docs.json`). Live responses only fill gaps, with a `FIXME` note on the schema.
- Use the `apiRequest` fixture from `fixtures/test.ts`: `apiRequest<Type>({ method, url: ToolshopApi.X, baseUrl: ENV.TOOLSHOP_API_URL, body, headers: token })`.
- Validate every body: `expect(SchemaName.parse(body)).toBeTruthy();`. Schemas use `z.strictObject()` (never `z.object()`) in `fixtures/api/schemas/<site>/`.
- No literal URLs, paths, tokens or credentials: `ENV.*`, `data/api-endpoints.ts`, and tokens from a login call inside the test (Toolshop tokens expire after 300 s).
- One `test.step('<Verb> <thing> via <METHOD> <path>')` per call when a test makes more than one call.
- Cover every status code the contract lists. For request bodies: empty body, each required field omitted, each field with `INVALID_*` values from `data/invalid-values.ts`. Fuzz every path parameter.
- API disagrees with the contract → keep the test as the contract says, `test.skip` with `// FIXME: DEF-NNN …` explaining why, and register it in `docs/DEFECTS.md`. Never change the expected status to match a bug (bug oracle: `.claude/skills/debugging/SKILL.md` §3).
- Specs: `tests/api/<site>/<resource>.spec.ts`; titles `'<Site> API: <behaviour> @api'`; clean up any data you create on a shared demo.
- Automating cases from `test-plans/<site>/`? Check the plan's Status first. Not **Approved** → stop and ask the user to review the plan.
