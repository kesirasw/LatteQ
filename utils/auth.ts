import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const AUTH_STATE_PATH = path.join(process.cwd(), '.auth', 'state.json');

export function authStateExists() {
  return fs.existsSync(AUTH_STATE_PATH);
}

export async function saveStorageState(page: Page) {
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH });
}
