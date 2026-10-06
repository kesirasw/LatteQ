#!/usr/bin/env node
// Capture a chrome-devtools CLI snapshot into ui-context/ in a commit-safe form.
//
//   node scripts/ui-context/snapshot.mjs <site> <state> [--page <pageId>] [--verbose]   capture from the running CLI daemon
//   node scripts/ui-context/snapshot.mjs --sanitize <file...>               clean files captured by hand
//
// Writes ui-context/<site>/<state>.snapshot.txt with a provenance header, and strips query strings
// and fragments from url="..." attributes (they carry session ids / OAuth state and churn on every visit).

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const pkg = require('chrome-devtools-mcp/package.json');
const CLI = path.join(path.dirname(require.resolve('chrome-devtools-mcp/package.json')), pkg.bin['chrome-devtools']);

const sanitize = (text) => text.replace(/url="([^"?#]*)[?#][^"]*"/g, 'url="$1"').replace(/\r\n/g, '\n');

const header = (state) =>
  [
    `# ui-context snapshot: ${state}`,
    `# captured: ${new Date().toISOString().slice(0, 10)} with chrome-devtools-mcp ${pkg.version} (headless Chrome)`,
    '# uids are session-only; never use them as locators. Regenerate locators with: npm run ui:map -- <this file>',
    '',
  ].join('\n');

const args = process.argv.slice(2);

if (args[0] === '--sanitize') {
  for (const file of args.slice(1)) {
    const text = fs.readFileSync(file, 'utf8');
    const body = text.startsWith('# ui-context snapshot') ? text : header(path.basename(file, '.snapshot.txt')) + text;
    fs.writeFileSync(file, sanitize(body));
    console.log(`sanitized ${file}`);
  }
  process.exit(0);
}

const [site, state] = args;
if (!site || !state) {
  console.error('usage: snapshot.mjs <site> <state> [--page <pageId>] | --sanitize <file...>');
  process.exit(1);
}
const pageIdx = args.indexOf('--page');
const pageId = pageIdx > -1 ? args[pageIdx + 1] : '2';

const verbose = args.includes('--verbose');

const tmp = path.join(os.tmpdir(), `ui-context-${process.pid}.txt`);
execFileSync(process.execPath, [CLI, 'take_snapshot', pageId, '--filePath', tmp, ...(verbose ? ['--verbose'] : [])], {
  stdio: 'pipe',
});
const out = path.join(ROOT, 'ui-context', site, `${state}${verbose ? '.verbose' : ''}.snapshot.txt`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, sanitize(header(state) + fs.readFileSync(tmp, 'utf8')));
fs.rmSync(tmp, { force: true });
console.log(`saved ${path.relative(ROOT, out)} (${fs.readFileSync(out, 'utf8').split('\n').length} lines)`);
