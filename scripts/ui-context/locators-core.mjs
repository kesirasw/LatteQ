// Shared locator logic for the ui-context scripts.
//
// Two snapshot formats become the same node tree:
//   parseCdt  — chrome-devtools CLI snapshots (`uid=1_2 button "Save"`), saved in ui-context/
//   parseAria — Playwright aria snapshots (`- button "Save" [ref=e5]`), e.g. the "Page snapshot"
//               in test-results/<test>/error-context.md written when a test fails
// buildRows() turns a node tree into Playwright locator candidates. uids/refs are session-only
// and are never emitted as locators.

// Chrome accessibility roles -> Playwright getByRole roles (only where they differ).
const ROLE_MAP = { image: 'img', Iframe: 'iframe', RootWebArea: null, StaticText: null, LabelText: null };

const INTERACTIVE = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'combobox',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'spinbutton',
  'option',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'listbox',
  'columnheader',
]);
export const LANDMARKS = new Set([
  'banner',
  'main',
  'navigation',
  'region',
  'form',
  'search',
  'complementary',
  'contentinfo',
  'dialog',
  'alertdialog',
  'table',
  'list',
  'tabpanel',
  'Iframe',
  'status',
  'alert',
]);
const LISTED = (role, all) => all || INTERACTIVE.has(role) || LANDMARKS.has(role) || role === 'heading';

const CDT_LINE = /^(\s*)uid=(\S+)\s+(\S+)(?:\s+"((?:[^"\\]|\\.)*)")?(.*)$/;
// `- role "name" [attr] [ref=e1]:` / `- role [ref=e2]: inline text`; `- text: …` and `- /url: …` aren't nodes
const ARIA_LINE = /^(\s*)- ([a-zA-Z]+)(?: "((?:[^"\\]|\\.)*)")?((?: \[[^\]]*\])*)(?::.*)?$/;

const tree = (entries) => {
  const nodes = [];
  const stack = [];
  for (const e of entries) {
    while (stack.length && stack[stack.length - 1].depth >= e.depth) stack.pop();
    const node = { ...e, parent: stack[stack.length - 1] ?? null };
    nodes.push(node);
    stack.push(node);
  }
  return nodes;
};

export const parseCdt = (text) =>
  tree(
    text
      .split(/\r?\n/)
      .map((raw) => raw.match(CDT_LINE))
      .filter(Boolean)
      .map(([, indent, uid, role, name = '', rest]) => ({
        uid,
        role,
        name,
        rest: rest.trim(),
        depth: indent.length / 2,
      })),
  );

export const parseAria = (text) =>
  tree(
    text
      .split(/\r?\n/)
      .map((raw) => raw.match(ARIA_LINE))
      .filter((m) => m && m[2] !== 'text')
      .map(([, indent, role, name = '', attrs]) => ({
        uid: (attrs.match(/\[ref=([^\]]+)\]/) || [])[1] ?? '',
        // normalise to the CLI's spelling so frame handling below is shared
        role: role === 'iframe' ? 'Iframe' : role,
        name: name.replace(/\\"/g, '"'),
        rest: attrs.trim(),
        depth: indent.length / 2,
      })),
  );

export const pwRole = (role) => (role in ROLE_MAP ? ROLE_MAP[role] : role);
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const byRole = (role, name, exact) =>
  name ? `getByRole(${q(role)}, { name: ${q(name)}${exact ? ', exact: true' : ''} })` : `getByRole(${q(role)})`;

// Nearest named landmark ancestor, used to scope ambiguous locators.
const scopeOf = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (LANDMARKS.has(p.role) && p.name && pwRole(p.role)) return p;
  }
  return null;
};

export const buildRows = (nodes, { all = false } = {}) => {
  const rows = [];
  for (const n of nodes) {
    const role = pwRole(n.role);
    if (!role || !LISTED(n.role, all)) continue;
    if (!n.name && !LANDMARKS.has(n.role)) continue; // unnamed controls can't be located by role+name

    const sameRole = nodes.filter((o) => o.role === n.role);
    const identical = sameRole.filter((o) => o.name === n.name).length;
    // getByRole name matching is substring + case-insensitive unless exact: true
    const substringHits = n.name
      ? sameRole.filter((o) => o.name.toLowerCase().includes(n.name.toLowerCase())).length
      : sameRole.length;
    const exact = n.name && substringHits > identical;

    // iframe is not an ARIA role Playwright accepts; frames are reached by title
    let locator =
      role === 'iframe' ? `page.getByTitle(${q(n.name)}).contentFrame()` : `page.${byRole(role, n.name, exact)}`;
    let status = 'unique';
    if (identical > 1 || (!n.name && sameRole.length > 1)) {
      const scope = scopeOf(n);
      const scopedPeers = scope
        ? nodes.filter((o) => o.role === n.role && o.name === n.name && scopeOf(o) === scope).length
        : identical;
      if (scope && scopedPeers === 1) {
        locator = `page.${byRole(pwRole(scope.role), scope.name, false)}.${byRole(role, n.name, exact)}`;
        status = `scoped (${identical} on page)`;
      } else {
        status = `AMBIGUOUS x${identical} — scope or filter manually`;
      }
    }
    const frame = (() => {
      for (let p = n.parent; p; p = p.parent) if (p.role === 'Iframe') return p;
      return null;
    })();
    if (frame) {
      locator = `page.getByTitle(${q(frame.name)}).contentFrame().${locator.replace(/^page\./, '')}`;
      status += ' · in iframe';
    }
    const scope = scopeOf(n);
    rows.push({ role, name: n.name, locator, status, within: scope ? `${pwRole(scope.role)} "${scope.name}"` : '' });
  }
  return rows;
};

export const esc = (s) => s.replace(/\|/g, '\\|');
