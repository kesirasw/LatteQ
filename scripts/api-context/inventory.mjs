#!/usr/bin/env node
// Build an endpoint inventory from an OpenAPI contract, for API test planning.
//
//   node scripts/api-context/inventory.mjs <contract-url-or-file> --site <site> [--tags User,Invoice]
//
// Saves api-context/<site>/openapi.json (the contract as fetched) and api-context/<site>/INVENTORY.md
// (one table per tag: method, path, summary, auth, path params, required body fields, documented responses).
// Without --site, prints the inventory to stdout and saves nothing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'query'];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : undefined;
};
const source = args[0];
const site = flag('site');
const tagFilter = flag('tags')
  ?.split(',')
  .map((t) => t.trim().toLowerCase());

if (!source || source.startsWith('--')) {
  console.error('usage: inventory.mjs <contract-url-or-file> --site <site> [--tags A,B]');
  process.exit(1);
}

const load = async () => {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Fetching ${source} failed: ${res.status}`);
    return res.json();
  }
  return JSON.parse(fs.readFileSync(source, 'utf8'));
};

// Resolve a local "#/components/..." reference (one level is enough for names/required lists).
const resolve = (spec, obj) => {
  if (!obj || !obj.$ref) return obj;
  return obj.$ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((acc, key) => acc?.[key], spec);
};

const bodyInfo = (spec, op) => {
  const content = resolve(spec, op.requestBody)?.content;
  if (!content) return '—';
  const schema = resolve(spec, Object.values(content)[0]?.schema);
  if (!schema) return 'body';
  const name = Object.values(content)[0]?.schema?.$ref?.split('/').pop();
  const required = schema.required?.length ? schema.required.join(', ') : 'none required';
  return name ? `${name}: ${required}` : required;
};

const responses = (spec, op) =>
  Object.entries(op.responses ?? {})
    .map(([code, r]) => {
      const res = resolve(spec, r);
      const schemaRef = res?.content && Object.values(res.content)[0]?.schema;
      const schemaName = schemaRef?.$ref?.split('/').pop() ?? schemaRef?.items?.$ref?.split('/').pop();
      return schemaName ? `${code} (${schemaName})` : code;
    })
    .join(', ');

const params = (spec, op, pathItem) =>
  [...(pathItem.parameters ?? []), ...(op.parameters ?? [])]
    .map((p) => resolve(spec, p))
    .filter((p) => p?.in === 'path')
    .map((p) => p.name)
    .join(', ') || '—';

const esc = (s) =>
  String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim();

const main = async () => {
  const spec = await load();
  const groups = new Map();
  let count = 0;

  for (const [p, item] of Object.entries(spec.paths ?? {})) {
    for (const m of METHODS) {
      const op = item[m];
      if (!op) continue;
      const tag = op.tags?.[0] ?? 'Untagged';
      if (tagFilter && !tagFilter.includes(tag.toLowerCase())) continue;
      const auth = (op.security ?? spec.security ?? []).length ? 'yes' : 'no';
      const row = `| ${m.toUpperCase()} | \`${p}\` | ${esc(op.summary)} | ${auth} | ${params(spec, op, item)} | ${esc(bodyInfo(spec, op))} | ${esc(responses(spec, op))} |`;
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(row);
      count++;
    }
  }

  const lines = [
    `# API inventory — ${spec.info?.title ?? site ?? 'API'}`,
    '',
    '| | |',
    '|---|---|',
    `| Contract | ${/^https?:/.test(source) ? source : path.basename(source)} (OpenAPI ${spec.openapi ?? spec.swagger ?? '?'}, version ${spec.info?.version ?? '?'}) |`,
    `| Server | ${spec.servers?.map((s) => s.url).join(', ') || '—'} |`,
    `| Generated | ${new Date().toISOString().slice(0, 10)} by scripts/api-context/inventory.mjs${tagFilter ? ` (tags: ${tagFilter.join(', ')})` : ''} |`,
    `| Operations | ${count} in ${groups.size} groups |`,
    '',
    'Generated from the contract. Do not edit by hand; re-run the script when the contract changes. "Auth" = the operation declares a security requirement.',
    '',
  ];
  for (const [tag, rows] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(
      `## ${tag}`,
      '',
      '| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |',
    );
    lines.push('|---|---|---|---|---|---|---|', ...rows, '');
  }
  const md = lines.join('\n');

  if (!site) {
    console.log(md);
    return;
  }
  const dir = path.join(ROOT, 'api-context', site);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'openapi.json'), JSON.stringify(spec, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'INVENTORY.md'), md + '\n');
  console.log(`saved api-context/${site}/openapi.json and INVENTORY.md (${count} operations, ${groups.size} groups)`);
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
