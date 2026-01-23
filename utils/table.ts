import { Locator, expect } from '@playwright/test';

export async function getColumnText(table: Locator, colIndex1Based: number) {
  const rows = table.locator('tbody tr');
  const count = await rows.count();
  const values: string[] = [];
  for (let i = 0; i < count; i++) {
    values.push(await rows.nth(i).locator(`td:nth-child(${colIndex1Based})`).innerText());
  }
  return values.map(v => v.trim());
}

export function isSortedAsc(values: string[]) {
  const norm = values.map(v => v.toLowerCase());
  return norm.every((v, i) => i === 0 || norm[i - 1] <= v);
}

export async function expectSortedAsc(values: string[]) {
  await expect(isSortedAsc(values), `Expected values sorted ASC but got: ${values.slice(0, 8).join(', ')}`).toBeTruthy();
}
