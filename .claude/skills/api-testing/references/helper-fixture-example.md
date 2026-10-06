# Helper fixture — lifecycle pattern

From `api-testing/SKILL.md` Phase 8. Adapted from agentic-playwright (MIT). Create one only when the same setup/teardown is needed in 3+ spec files.

## Pattern

```ts
// fixtures/api/helper-fixture.ts
import { test as base } from '@playwright/test';
import { apiRequest } from './plain-function';
import { ENV } from '../../data/env';
import { ToolshopApi } from '../../data/api-endpoints';
import type { LoginResponse } from './schemas/toolshop/userSchema';

type HelperFixtures = {
  /** A fresh Toolshop access token for the demo customer (expires after 300 s). */
  toolshopToken: string;
};

export const test = base.extend<HelperFixtures>({
  toolshopToken: async ({ request }, use) => {
    // Setup: runs before the test
    const { status, body } = await apiRequest({
      request,
      method: 'POST',
      url: ToolshopApi.LOGIN,
      baseUrl: ENV.TOOLSHOP_API_URL,
      body: { email: ENV.TOOLSHOP_EMAIL, password: ENV.TOOLSHOP_PASSWORD },
    });
    if (status !== 200) throw new Error(`Toolshop login failed with ${status}`);

    const { access_token } = body as LoginResponse;
    await use(access_token);

    // Teardown: runs after the test, even if it failed
    await apiRequest({ request, method: 'GET', url: ToolshopApi.LOGOUT, baseUrl: ENV.TOOLSHOP_API_URL, headers: access_token });
  },
});
```

Then add it to `fixtures/test.ts`: `export const test = mergeTests(uiTest, apiRequestFixture, helperFixture);`

## Lifecycle

1. **Setup:** code before `await use(...)` runs before the test.
2. **Yield:** `use(value)` hands the value to the test (`async ({ toolshopToken }) => …`).
3. **Teardown:** code after `use` runs after the test, pass or fail.

## Decision

Only promote when the same multi-step setup/teardown appears in **3+ spec files**. Otherwise keep it in the spec (`beforeEach`/`afterEach` with `apiRequest`).
