// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md
import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiRequestParams } from './api-types';

/**
 * Core HTTP call used by the `apiRequest` fixture and by helper fixtures.
 * Tests should use the `apiRequest` fixture from fixtures/test.ts, not this function.
 * Returns the status code and the body parsed as JSON (or text), or null when there is no body.
 */
export async function apiRequest({
  request,
  method,
  url,
  baseUrl,
  body = null,
  headers,
  authType = 'Bearer',
}: ApiRequestParams & { request: APIRequestContext }): Promise<{ status: number; body: unknown }> {
  const options: { data?: Record<string, unknown>; headers: Record<string, string> } = {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  };
  if (body) options.data = body;
  if (headers) options.headers.Authorization = `${authType} ${headers}`;

  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

  let response: APIResponse;
  switch (method) {
    case 'POST':
      response = await request.post(fullUrl, options);
      break;
    case 'GET':
      response = await request.get(fullUrl, options);
      break;
    case 'PUT':
      response = await request.put(fullUrl, options);
      break;
    case 'DELETE':
      response = await request.delete(fullUrl, options);
      break;
    case 'PATCH':
      response = await request.patch(fullUrl, options);
      break;
  }

  const status = response.status();
  const contentType = response.headers()['content-type'] ?? '';

  let bodyData: unknown = null;
  try {
    if (contentType.includes('application/json')) {
      bodyData = await response.json();
    } else if (contentType.includes('text/')) {
      bodyData = await response.text();
    }
  } catch (err) {
    // An unparseable body is worth seeing in the report, but the status code is still returned for assertions
    console.warn(`Failed to parse response body for status ${status}: ${err}`);
  }

  return { status, body: bodyData };
}
