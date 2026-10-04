#!/usr/bin/env node
// PreToolUse hook (Write|Edit|MultiEdit): blocks edits that INTRODUCE a CLAUDE.md WON'T violation.
// Only newly added occurrences are blocked (count in new text > count in replaced text), so
// pre-existing violations don't stop unrelated edits to the same file.
// Exit 0 = allow, exit 2 = block (stderr is shown to Claude).

import fs from 'node:fs';
import path from 'node:path';

const SCOPED_DIRS = ['pages/', 'tests/', 'fixtures/', 'utils/', 'data/'];

const inDirs =
  (...dirs) =>
  (rel) =>
    dirs.some((d) => rel.startsWith(d));
const isSpec = (rel) => rel.startsWith('tests/') && /\.spec\.(ts|js)$/.test(rel);

const regexRule = (re) => (text) => (text.match(re) || []).length;

// `force: true` is allowed only with a comment on the same or previous line.
const undocumentedForce = (text) => {
  const lines = text.split(/\r?\n/);
  return lines.filter(
    (line, i) => /force:\s*true/.test(line) && !line.includes('//') && !(lines[i - 1] ?? '').includes('//'),
  ).length;
};

const RULES = [
  {
    id: 'hard-wait',
    applies: inDirs(...SCOPED_DIRS),
    count: regexRule(/\.waitForTimeout\s*\(/g),
    fix: 'Use a web-first assertion, waitForURL, or Network.waitForResponseContains (debugging skill).',
  },
  {
    id: 'xpath',
    applies: inDirs('pages/', 'tests/'),
    count: regexRule(/(['"`])(xpath=|\/\/[a-zA-Z*])/g),
    fix: 'Use getByRole/getByLabel/getByPlaceholder/getByText/getByTestId (selectors skill).',
  },
  {
    id: 'playwright-import-in-spec',
    applies: isSpec,
    count: regexRule(/from\s+['"]@playwright\/test['"]|require\(\s*['"]@playwright\/test['"]\s*\)/g),
    fix: 'Import test/expect from fixtures/test.ts (CLAUDE.md MUST #1).',
  },
  {
    id: 'focused-test',
    applies: inDirs('tests/'),
    count: regexRule(/\b(test|describe)(\.describe)?\.only\s*\(/g),
    fix: 'Remove .only before saving.',
  },
  {
    id: 'swallowed-error',
    applies: inDirs('pages/', 'tests/', 'fixtures/'),
    count: regexRule(/\.catch\(\s*(async\s*)?\(\s*\w*\s*\)\s*=>\s*\{\s*\}\s*\)/g),
    fix: 'Let it fail, or branch explicitly with `if (await loc.isVisible())` plus a comment.',
  },
  {
    id: 'any-type',
    applies: inDirs(...SCOPED_DIRS),
    count: regexRule(/:\s*any\b|<any>|\bas\s+any\b/g),
    fix: 'Use a proper type.',
  },
  {
    id: 'ts-ignore',
    applies: inDirs(...SCOPED_DIRS),
    count: regexRule(/@ts-(ignore|nocheck)/g),
    fix: 'Fix the type error instead of suppressing it.',
  },
  {
    id: 'hardcoded-url',
    applies: inDirs('pages/', 'tests/'),
    count: regexRule(/['"`]https?:\/\//g),
    fix: 'Add the URL to ENV in data/env.ts and reference ENV.* (data-config skill).',
  },
  {
    id: 'undocumented-force',
    applies: inDirs('pages/', 'tests/'),
    count: undocumentedForce,
    fix: 'Dismiss the overlay instead, or add a comment naming the overlay (and a knowledge-base entry).',
  },
  {
    id: 'skip-without-reason',
    applies: inDirs('tests/'),
    count: regexRule(/\btest\.(skip|fixme)\(\s*\)/g),
    fix: "Pass a condition and reason: test.skip(cond, 'why').",
  },
  {
    id: 'loose-zod-schema',
    applies: inDirs('fixtures/api/schemas/'),
    count: regexRule(/\bz\.object\s*\(/g),
    fix: 'Use z.strictObject() so unexpected fields fail validation (api-testing skill).',
  },
  {
    id: 'bare-schema-parse',
    applies: (rel) => rel.startsWith('tests/'),
    // Schema.parse(body) must be wrapped: expect(Schema.parse(body)).toBeTruthy()
    count: (text) =>
      text
        .split(/\r?\n/)
        .filter((l) => /\b[A-Z]\w*Schema\.parse\(/.test(l) && !/expect\(\s*[A-Z]\w*Schema\.parse\(/.test(l)).length,
    fix: 'Validate with expect(SchemaName.parse(body)).toBeTruthy() (api-testing skill).',
  },
];

// Git Bash on Windows hands over paths like /c/Users/...; Node on Windows needs C:/Users/...
const fromMsysPath = (p) =>
  process.platform === 'win32' ? p.replace(/^\/([a-zA-Z])\//, (_, drive) => `${drive.toUpperCase()}:/`) : p;

const readStdin = () => {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
};

// Returns [{ before, after }] pairs describing what the tool call replaces.
const changesFor = (toolName, input, absPath) => {
  if (toolName === 'Write') {
    const before = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
    return [{ before, after: input.content ?? '' }];
  }
  if (toolName === 'Edit') {
    return [{ before: input.old_string ?? '', after: input.new_string ?? '' }];
  }
  if (toolName === 'MultiEdit') {
    return (input.edits ?? []).map((e) => ({ before: e.old_string ?? '', after: e.new_string ?? '' }));
  }
  return [];
};

const main = () => {
  let payload;
  try {
    payload = JSON.parse(readStdin() || '{}');
  } catch {
    return 0; // unparseable input: don't block the user's work
  }

  const toolName = payload.tool_name;
  const input = payload.tool_input ?? {};
  if (!input.file_path || !/\.(ts|js)$/.test(input.file_path)) return 0;

  const projectDir = fromMsysPath(process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd());
  const absPath = path.resolve(projectDir, fromMsysPath(input.file_path));
  const rel = path.relative(projectDir, absPath).split(path.sep).join('/');
  if (rel.startsWith('..')) return 0;

  const changes = changesFor(toolName, input, absPath);
  const violations = [];
  for (const rule of RULES) {
    if (!rule.applies(rel)) continue;
    const added = changes.reduce((n, c) => n + Math.max(0, rule.count(c.after) - rule.count(c.before)), 0);
    if (added > 0) violations.push(`  - ${rule.id} (x${added}): ${rule.fix}`);
  }

  if (violations.length === 0) return 0;

  process.stderr.write(
    `Blocked by LatteQ Constitution hook (CLAUDE.md WON'T) — ${rel}\n` +
      `${violations.join('\n')}\n` +
      'Revise the change to remove these, or ask the user if the rule genuinely must be bypassed.\n',
  );
  return 2;
};

process.exit(main());
