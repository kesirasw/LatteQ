import { Page, Response } from '@playwright/test';

export class Network {
  constructor(private readonly page: Page) {}

  async waitForResponseContains(urlPart: string, opts?: { timeout?: number; status?: number }): Promise<Response> {
    return await this.page.waitForResponse(
      (r) => r.url().includes(urlPart) && (opts?.status ? r.status() === opts.status : true),
      { timeout: opts?.timeout ?? 20_000 },
    );
  }

  async captureJson(urlPart: string, action: () => Promise<void>, opts?: { timeout?: number }) {
    const respPromise = this.page.waitForResponse((r) => r.url().includes(urlPart), {
      timeout: opts?.timeout ?? 20_000,
    });
    await action();
    const resp = await respPromise;
    const json = await resp.json().catch(() => null);
    return { resp, json };
  }
}
