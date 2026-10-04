---
name: selectors
description: Locator strategy for LatteQ page objects — priority order (getByRole → getByLabel → getByPlaceholder → getByText → getByTestId → scoped CSS), resolving strict-mode violations with exact/scoping/filter instead of .first(), and patterns for portals, overlays, tables, SVG charts and dynamic IDs on the practice sites. Load when choosing, writing or fixing any locator, or when a test fails with "strict mode violation", "resolved to N elements" or "element not found".
---

# Selectors

## Critical

- **Priority order:** `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → scoped CSS. Moving down a step needs a reason (a comment for CSS).
- **No XPath. Ever.**
- **No blind `.first()` / `.nth()`.** If a locator matches several elements, make it unique (`exact: true`, scope to a container, `filter({ hasText })`). `.first()` is allowed only when "any of these" is genuinely the intent (e.g. "first search result"), and the method name must say so (`openFirstResult`).
- **No auto-generated IDs or hashed classes** (`#mui-123`, `.css-1x2y3z`, `.sc-abc`). They change between builds.
- **Every locator comes from a snapshot** (`explore`).

## Choosing a locator

| Element | Prefer | Example |
|---------|--------|---------|
| Button / link | role + name | `page.getByRole('button', { name: 'Search' })` |
| Text input with label | label | `page.getByLabel('Email')` |
| Input with only placeholder | placeholder | `page.getByPlaceholder(/where are you going/i)` |
| Heading | role + level/exact | `page.getByRole('heading', { name: 'Dynamic ID', exact: true })` |
| Table header | role + exact | `page.getByRole('columnheader', { name: 'Name', exact: true })` |
| Dropdown option (portal) | role on page, not container | `page.getByRole('option', { name: 'Ten' })` |
| Element with a stable `data-testid` | test id | `page.getByTestId('property-card')` |
| Table body / SVG / canvas | scoped CSS | `this.table.locator('tbody tr')` |

Use regex with `i` for names that vary in casing or trailing text; use `exact: true` when a shorter name is a prefix of a longer one.

## Resolving strict-mode violations

Error: `strict mode violation: getByRole(...) resolved to 2 elements`. In order of preference:

1. **`exact: true`** — fixes "Name" vs "Name: Activate to invert" (DataTables, see knowledge base §1).
2. **Scope to a container** — `page.getByRole('main').getByRole('heading', { name: 'Select' })` (MUI, §5).
3. **`filter`** — `rows.filter({ hasText: 'London' })`, `cards.filter({ has: page.getByRole('link') })`.
4. **More specific role** — `link` vs `button`, add `level` for headings.
5. Only then, and only if "any one" is the intent, `.first()` with an intent-revealing method name.

## Site patterns

- **Portals (MUI Select, autocompletes):** the listbox renders at `<body>` level, so query `page.getByRole('option')`, not inside the trigger's container.
- **Overlays intercepting clicks (Booking.com, GitHub):** find and dismiss the overlay (close button by role/name) first. `force: true` is a last resort that needs a comment naming the overlay plus a knowledge-base entry.
- **Dynamic IDs (UITP "Dynamic ID"):** role + visible name is stable even when `id` changes.
- **SVG charts (Highcharts):** scope to the chart container, then CSS for series points (`.highcharts-point`); wait for the series to be visible before hovering. Assert the tooltip by text.
- **Tables (DataTables):** keep a `table` locator on the page object; derive rows/cells from it (`this.table.locator('tbody tr')`) and read them with `utils/table.ts`.

## Anti-patterns → fixes

| Seen | Fix |
|------|-----|
| `page.locator('#example tbody tr')` in a spec | Expose `rows` on the page object |
| `page.locator('input[name="ss"]')` | `getByPlaceholder` / `getByLabel` / `getByRole('combobox')` from the snapshot |
| `'[data-testid="a"], [role="option"]'` (OR-selector to cover unknown DOM) | Explore and pick the one that's actually there |
| `.first()` to silence strict mode | One of the five resolutions above |
