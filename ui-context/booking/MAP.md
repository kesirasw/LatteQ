# Booking.com — UI map

| | |
|---|---|
| Base URL | `ENV.BOOKING_URL` (`https://www.booking.com/`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome (en-US) |
| Snapshots | `home.signin-modal` · `home.after-dismiss` · `home.autocomplete-melbourne` · `search-results` |
| Used by | `pages/BookingPage.ts` · `tests/practice/02_forms_booking.spec.ts` (`test.fixme`) |
| Last verified by run | not runnable in Playwright's bundled Chromium (KB §8) |

## Quirks
- **Bot check:** Playwright's bundled Chromium gets HTTP 202 + reload, and typed input is wiped (failed 3/3). **Real Chrome via the CLI passes**, and the full flow works. Worth trying `channel: 'chrome'` in Playwright to un-fixme the spec.
- **Sign-in modal** ("Window offering discounts of 10% or more…", `modal`) appears at a **variable time** after load: sometimes before the first snapshot, sometimes after. While it's open the snapshot contains only the modal. Dismiss with "Dismiss sign-in info." whenever it appears.
- **A/B variants of the destination combobox:** named "Enter destination" on some visits and "Search in your own words" (AI search) on others. Locate it **by role inside region "Search properties"** (the only combobox there), not by name.
- Search with a destination and **no dates** lands on a **city page** (`/city/au/melbourne.html`, heading "Melbourne – N hotels and places to stay"), **not** `/searchresults`. `BookingPage.assertResults()` expects `/searchresults`: update it, or pick dates first.
- Copy differs by locale (en-GB "travellers" vs en-US "travelers"); currency follows geo-IP.

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open | heading "Find your next stay"; modal may appear |
| 2 | click "Dismiss sign-in info." (if modal) | modal gone |
| 3 | fill destination combobox `Melbourne` | listbox "List of suggested destinations" with options "Melbourne CBD …", "Melbourne Victoria (Melbourne Region), Australia", … (last option "Melbourne Search with AI") |
| 4 | click option "Melbourne Victoria …" | combobox value set |
| 5 | click "Search" in region | navigates to `/city/au/melbourne.html` (no dates) |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| signInModal | `page.getByRole('dialog', { name: /sign in to Booking\.com/ })` | cdt | |
| dismissSignIn | `page.getByRole('button', { name: 'Dismiss sign-in info.' })` | cdt | |
| searchForm | `page.getByRole('region', { name: 'Search properties' })` | cdt | |
| destinationInput | `searchForm.getByRole('combobox')` | cdt | Name varies by A/B variant, so match by role only. **POM currently matches by name `Enter destination`: update** |
| suggestions | `page.getByRole('listbox', { name: /List of suggested destinations/ })` | cdt | |
| suggestion(text) | `suggestions.getByRole('option', { name: /^Melbourne Victoria/ })` | cdt | Avoid the "… Search with AI" option |
| searchButton | `searchForm.getByRole('button', { name: 'Search', exact: true })` | cdt | |
| cityHeading | `page.getByRole('heading', { level: 2, name: /^Melbourne – \d+ hotels/ })` | cdt | City landing page |
| propertyCards | `page.getByTestId('property-card')` | not verified | `data-testid` isn't in the a11y snapshot, and `/searchresults` wasn't reached without dates |

## Gaps
- Date picker and occupancy flows are not mapped. They're needed to reach `/searchresults`.
