#!/usr/bin/env node
// Suggests replacement locators for a failed test from the page snapshot Playwright saved at the
// moment of failure (test-results/<test>/error-context.md). Read-only: it never edits code or maps.
//
//   node scripts/ui-context/heal-suggest.mjs <error-context.md | test-results dir> [--locator "<failing locator>"] [--top N]
//
// --locator is the locator from the error, e.g. "getByRole('button', { name: 'Place order' })".
// Without it the script looks for one in the file, and otherwise lists every candidate.
// Output: ranked candidates per failure plus the guardrails from the debugging skill (assisted healing).

import fs from 'node:fs';
import path from 'node:path';
import { buildRows, esc, parseAria } from './locators-core.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const locatorArg = flag('--locator');
const top = Number(flag('--top') ?? 5);
const [input] = args;

if (!input || !fs.existsSync(input)) {
  console.error(
    'usage: heal-suggest.mjs <error-context.md | test-results dir> [--locator "<failing locator>"] [--top N]',
  );
  process.exit(1);
}

const findContexts = (p) =>
  fs.statSync(p).isDirectory()
    ? fs.readdirSync(p, { withFileTypes: true }).flatMap((d) => findContexts(path.join(p, d.name)))
    : path.basename(p) === 'error-context.md'
      ? [p]
      : [];

const STR = String.raw`'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|/((?:[^/\\]|\\.)*)/[a-z]*`;
const unq = (m, from) => m[from] ?? m[from + 1] ?? m[from + 2] ?? '';

// The element the test was looking for: { role?, name?, raw }.
const parseTarget = (text) => {
  const role = text.match(new RegExp(String.raw`getByRole\(\s*(?:${STR})`));
  if (role) {
    const name = text.slice(role.index).match(new RegExp(String.raw`name:\s*(?:${STR})`));
    const r = unq(role, 1);
    const n = name ? unq(name, 1) : '';
    return { role: r, name: n, raw: n ? `getByRole('${r}', { name: '${n}' })` : `getByRole('${r}')` };
  }
  const other = text.match(new RegExp(String.raw`getBy(?:Text|Label|Placeholder|Title|AltText)\(\s*(?:${STR})`));
  return other ? { role: '', name: unq(other, 1), raw: `${other[0]})` } : null;
};

const levenshtein = (a, b) => {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
};
const tokens = (s) => new Set(s.toLowerCase().match(/[a-z0-9]+/g) ?? []);
const similarity = (a, b) => {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.85;
  const ta = tokens(x);
  const tb = tokens(y);
  const shared = [...ta].filter((t) => tb.has(t)).length;
  const jaccard = shared / (new Set([...ta, ...tb]).size || 1);
  const lev = 1 - levenshtein(x, y) / Math.max(x.length, y.length);
  return Math.max(jaccard, lev);
};

const report = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  const nodes = parseAria(text);
  console.log(`## ${file}\n`);
  if (!nodes.length) {
    console.log('No page snapshot in this file (the test failed before a page was open?).\n');
    return;
  }
  const target = parseTarget(locatorArg ?? text);
  const rows = buildRows(nodes, { all: true }).filter((r) => r.role !== 'generic');

  if (!target) {
    console.log('No failing locator found; pass --locator "<locator from the error>". All candidates:\n');
  } else {
    console.log(`Looking for: \`${target.raw}\`${target.name ? ` (name "${target.name}")` : ''}\n`);
    const same = rows.filter((r) => (!target.role || r.role === target.role) && r.name === target.name);
    if (same.length) {
      console.log(
        `> The element **is in the snapshot unchanged** (${same.length} match${same.length > 1 ? 'es' : ''}). ` +
          'This is not a locator change: look at timing, visibility, overlays or strict-mode ambiguity instead (debugging §2). Do not heal.\n',
      );
    }
  }

  const scored = rows
    .map((r) => {
      const nameScore = target?.name ? similarity(target.name, r.name) : 0;
      const roleMatch = Boolean(target?.role) && r.role === target.role;
      return { ...r, nameScore, roleMatch, score: nameScore * 0.75 + (roleMatch ? 0.25 : 0) };
    })
    .filter((r) => !target || r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, target ? top : rows.length);

  if (!scored.length) {
    console.log(
      'No similar element on the page. The element may be gone or the page is in another state: refresh that state with the chrome-devtools CLI (ui-context) and diff it against the map.\n',
    );
    return;
  }
  console.log('| # | Score | Role | Name | Name vs test | Playwright locator | Uniqueness | Within |');
  console.log('|---|---|---|---|---|---|---|---|');
  scored.forEach((r, i) => {
    const change = !target?.name
      ? ''
      : r.name === target.name
        ? 'same'
        : `**changed** ("${esc(target.name)}" → "${esc(r.name)}")`;
    console.log(
      `| ${i + 1} | ${r.score.toFixed(2)} | ${r.role}${target?.role && !r.roleMatch ? ' (role differs)' : ''} | ${esc(r.name)} | ${change} | \`${esc(r.locator)}\` | ${r.status} | ${esc(r.within)} |`,
    );
  });
  console.log('');
};

const files = findContexts(input);
if (!files.length) {
  console.error(`No error-context.md under ${input}. Run the failing test first; Playwright writes one per failure.`);
  process.exit(1);
}
files.forEach(report);
console.log(
  [
    '---',
    'Guardrails (debugging skill, "Assisted healing"):',
    '- These are suggestions from the failed page only. Confirm the state with a chrome-devtools CLI snapshot before changing MAP.md or a page object.',
    '- A **changed** user-visible name is a bug-oracle question first: intended change → heal; otherwise record a suspected defect (docs/DEFECTS.md) and do not heal.',
    '- Heal locators only. Never change an assertion, expected text or test data to make the test pass.',
    '- 3+ broken locators on one page = redesign: re-crawl the state instead of patching one by one.',
  ].join('\n'),
);
