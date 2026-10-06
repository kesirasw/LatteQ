// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md
import { test as base } from '@playwright/test';
import { apiRequest as apiRequestPlain } from './plain-function';
import type { ApiRequestFn, ApiRequestMethods, ApiRequestParams, ApiRequestResponse } from './api-types';

/** Provides `apiRequest` to tests: a typed wrapper over Playwright's request context. */
export const test = base.extend<ApiRequestMethods>({
  apiRequest: async ({ request }, use) => {
    const apiRequestFn: ApiRequestFn = async <T = unknown>(
      params: ApiRequestParams,
    ): Promise<ApiRequestResponse<T>> => {
      const response = await apiRequestPlain({ request, ...params });
      return { status: response.status, body: response.body as T };
    };

    await use(apiRequestFn);
  },
});
