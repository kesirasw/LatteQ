# MUI Select docs — UI map

| | |
|---|---|
| Base URL | `ENV.MUI_URL` (`https://mui.com/material-ui/react-select/`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome |
| Snapshots | `react-select` · `react-select.age-open` |
| Used by | `pages/MUIPage.ts` · `tests/practice/05_components_mui.spec.ts` |
| Last verified by run | 2026-10-04 (05 spec 3/3) |

## Quirks
- **16 comboboxes named "Age"** on the page (Basic, Outlined/Standard/Filled variants, Native, etc.). The Basic select demo is the first.
- The options list renders in a **portal at body level**. While it's open, the snapshot shows *only* the listbox (the rest of the page is inert).
- The docs heading "Select" (level 1) must be matched with `exact: true` (many headings contain "select").

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open | heading "Select" level 1 |
| 2 | click first combobox "Age" | listbox "Age" with options Ten / Twenty / Thirty |
| 3 | click option "Ten" | combobox text becomes "Ten" |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| pageHeading | `page.getByRole('heading', { name: 'Select', exact: true })` | cdt | |
| basicSelect | `page.getByRole('combobox', { name: 'Age' }).first()` | cdt | `.first()` = Basic select demo (intentional, commented in POM) |
| ageListbox | `page.getByRole('listbox', { name: 'Age' })` | cdt | Portal; query from `page`, not from the combobox |
| ageOption(name) | `ageListbox.getByRole('option', { name: '<name>' })` | cdt | Ten / Twenty / Thirty |

## Gaps
- Multiple select, chip select and grouped select demos are in `react-select.snapshot.txt` but not curated.
