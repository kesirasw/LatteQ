# DataTables — UI map

| | |
|---|---|
| Base URL | `ENV.DATATABLES_URL` → `/examples/core/basic_init/zero_configuration.html` |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome |
| Snapshots | `zero-configuration` · `zero-configuration.verbose` (table structure) · `zero-configuration.searched-london` |
| Used by | `pages/DataTablesPage.ts` · `tests/practice/01_tables_datatables.spec.ts` |
| Last verified by run | 2026-10-04 (01 spec 3/3) |

## Quirks
- The old URL `/examples/basic_init/…` redirects to `/examples/core/basic_init/…`.
- The default snapshot omits table rows/cells. Use the `verbose` snapshot for table structure.
- **Header vs footer:** the header cell's name is `Office Office: Activate to sort`, the footer cell's is `Office`. `getByRole('columnheader', { name: 'Office', exact: true })` hits the **footer**, which is not sortable (KB §11).
- The table loads sorted by Name ascending, so test sorting on a different column.

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open | `status` = "Showing 1 to 10 of 57 entries" |
| 2 | fill searchbox "Search:" with `London` | `status` = "Showing 1 to 10 of 12 entries (filtered from 57 total entries)" |
| 3 | click button "Office: Activate to sort" | header cell gets `aria-sort="ascending"` |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| table | `page.locator('#example')` | cdt (verbose) | Authored id, not generated. No accessible name on the table |
| searchBox | `page.getByRole('searchbox', { name: 'Search:' })` | cdt | |
| rows | `table.locator('tbody tr')` | run | Rows have names = full row text; use CSS for "all rows" |
| status | `page.getByRole('status')` | cdt | Live region with the "Showing … entries" text |
| sortButton(col) | `table.getByRole('button', { name: /^<col>: Activate to/ })` | cdt | Becomes "…: Activate to invert sorting" once sorted |
| headerCell(col) | `table.getByRole('columnheader', { name: /^<col> / })` | cdt (verbose) | Trailing space excludes the footer cell |
| pageSize | `page.getByRole('combobox', { name: 'entries per page' })` | cdt | Native select: 10/25/50/100 |
| pagination | `page.getByRole('navigation', { name: 'pagination' })` | cdt | Links "First", "Previous", "1"…"6", "Next", "Last" |

## Gaps
- Column filtering and the page-size change flow are not mapped yet.
