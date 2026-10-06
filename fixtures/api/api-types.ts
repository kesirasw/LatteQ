// Adapted from agentic-playwright (MIT, © 2026 Ivan Davidov and contributors) — see docs/THIRD-PARTY-NOTICES.md

/** Supported authentication schemes for API requests */
export type AuthType = 'Bearer' | 'Token' | 'Basic';

/** Parameters for an API request made through the `apiRequest` fixture. */
export type ApiRequestParams = {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  /** Endpoint path, e.g. `ToolshopApi.LOGIN` */
  url: string;
  /** Base URL prepended to `url`, e.g. `ENV.TOOLSHOP_API_URL` */
  baseUrl?: string;
  body?: Record<string, unknown> | null;
  /** Token for the Authorization header */
  headers?: string;
  /** Authorization scheme (default: 'Bearer') */
  authType?: AuthType;
};

/** Status code and parsed body of an API response. */
export type ApiRequestResponse<T = unknown> = {
  status: number;
  body: T;
};

export type ApiRequestFn = <T = unknown>(params: ApiRequestParams) => Promise<ApiRequestResponse<T>>;

export type ApiRequestMethods = {
  apiRequest: ApiRequestFn;
};
