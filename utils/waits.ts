import { Page } from '@playwright/test';

export async function waitForDomSettled(page: Page, ms = 250) {
  // lightweight: two RAFs + a small timeout
  await page.evaluate(
    (delay) =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, delay)));
      }),
    ms
  );
}
