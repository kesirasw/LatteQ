# Negative and validation testing — patterns

Long-form code for `api-testing/SKILL.md` Phase 6. Adapted from agentic-playwright (MIT).

## Universal invalid values (`data/invalid-values.ts`)

| Field type | Constant | Values |
|---|---|---|
| string (required) | `INVALID_STRING_VALUES` | `[123, true, null, undefined]` |
| id | `INVALID_ID_VALUES` | `['not-an-id', '', 123, null, undefined]` |
| number | `INVALID_NUMBER_VALUES` | `['string', '123', true, null, undefined]` |
| boolean | `INVALID_BOOLEAN_VALUES` | `['yes', 1, 0, null, undefined]` |
| enum | `INVALID_ENUM_VALUES` | `['invalidValue', '', 123, null, undefined]` |
| array | `INVALID_ARRAY_VALUES` | `['string', 123, null, undefined, {}]` |
| object | `INVALID_OBJECT_VALUES` | `['string', 123, null, undefined, []]` |

For email fields, run two loops: `INVALID_STRING_VALUES` (wrong type) and a site-specific list of malformed emails (wrong format) from `data/<site>-invalid-data.ts`.

## Spread-and-override, one field at a time

```ts
import { INVALID_STRING_VALUES } from '../../../data/invalid-values';
import {
  UnprocessableEntityResponse,
  UnprocessableEntityResponseSchema,
} from '../../../fixtures/api/schemas/toolshop/errorResponseSchema';

test.describe('POST /users/login — validation', () => {
  const validPayload = { email: ENV.TOOLSHOP_EMAIL, password: ENV.TOOLSHOP_PASSWORD };

  for (const invalidValue of INVALID_STRING_VALUES) {
    test(`Toolshop API: login rejects email = ${JSON.stringify(invalidValue)} @api`, async ({ apiRequest }) => {
      const { status, body } = await apiRequest<UnprocessableEntityResponse>({
        method: 'POST',
        url: ToolshopApi.LOGIN,
        baseUrl: ENV.TOOLSHOP_API_URL,
        body: { ...validPayload, email: invalidValue },
      });

      expect(status).toBe(422); // use the code the contract documents (or the observed one, commented)
      expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
    });
  }
});
```

## Omitting each required field

```ts
const requiredFields = ['email', 'password'] as const;
for (const field of requiredFields) {
  test(`Toolshop API: login rejects a body without ${field} @api`, async ({ apiRequest }) => {
    const { [field]: _omitted, ...payloadWithoutField } = validPayload;

    const { status, body } = await apiRequest<UnprocessableEntityResponse>({
      method: 'POST',
      url: ToolshopApi.LOGIN,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: payloadWithoutField,
    });

    expect(status).toBe(422);
    expect(UnprocessableEntityResponseSchema.parse(body)).toBeTruthy();
  });
}
```

(`_omitted` matches the `argsIgnorePattern: '^_'` lint rule.)

## Path-parameter fuzzing

```ts
const invalidProductIds = [
  { description: 'numeric string', value: '99999' },
  { description: 'boolean-like string', value: 'true' },
  { description: 'special characters', value: '<script>' },
  { description: 'injection attempt', value: '1 OR 1=1' },
];
for (const { description, value } of invalidProductIds) {
  test(`Toolshop API: unknown product id is not found (${description}) @api`, async ({ apiRequest }) => {
    const { status } = await apiRequest<NotFoundResponse>({
      method: 'GET',
      url: `${ToolshopApi.PRODUCTS}/${encodeURIComponent(value)}`,
      baseUrl: ENV.TOOLSHOP_API_URL,
    });

    expect(status).toBe(404);
  });
}
```

Required for every path parameter, whether or not the contract mentions it.

## Three tiers: where invalid values live

1. **Universal type mismatches:** `data/invalid-values.ts`. Import, never redefine.
2. **Site-specific curated sets** (malformed emails, weak passwords, bad country/state pairs): `data/<site>-invalid-data.ts`, `as const`, never `.json`.
3. **One field's boundary set** (e.g. a quantity limited to 1–99: `[0, -1, 100, 1.5]`): inline in the spec. Promote it when it's reused.
