# Booking.com — UI map

| | |
|---|---|
| Base URL | `ENV.BOOKING_URL` (`https://www.booking.com/`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome (en-US) |
| Snapshots | `home.signin-modal` · `home.after-dismiss` · `home.autocomplete-melbourne` · `search-results` |
| Used by | `pages/BookingPage.ts` · `tests/practice/02_forms_booking.spec.ts` (runs on `channel: 'chrome'`) |
| Last verified by run | 2026-10-04 (02 spec 5/5 on real Chrome) |

## Quirks
- **Bot check:** Playwright's bundled Chromium gets HTTP 202 + reload, and typed input is wiped (failed 3/3). **Real Chrome passes**, both via the CLI and via Playwright `channel: 'chrome'`. The spec sets `test.use({ channel: 'chrome' })`.
- **Sign-in modal** ("Window offering discounts of 10% or more…", `modal`) appears at a **variable time** after load: sometimes before the first snapshot, sometimes after. While it's open the snapshot contains only the modal. The POM registers `page.addLocatorHandler(signInModal, dismiss)`, so it's dismissed whenever it shows up.
- **Typed value can be wiped** right after load. The open listbox is then **"Trending destinations"** (empty input) instead of "List of suggested destinations". Retry fill until the suggestions listbox appears (`toPass`).
- **A/B variants of the destination combobox:** named "Enter destination" on some visits and "Search in your own words" (AI search) on others. Locate it **by role inside region "Search properties"** (the only combobox there), not by name.
- **Where Search lands depends on the suggestion picked:** the first suggestion ("Melbourne CBD …") → `/searchresults` (date picker auto-opens, region "Filters", **no** city heading). "Melbourne Victoria …" → city page `/city/au/melbourne.html` (heading "Melbourne – N hotels and places to stay"). The POM picks the first non-AI suggestion → `/searchresults`.
- Copy differs by locale (en-GB "travellers" vs en-US "travelers"); currency follows geo-IP.

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open | heading "Find your next stay"; modal may appear |
| 2 | click "Dismiss sign-in info." (if modal) | modal gone |
| 3 | fill destination combobox `Melbourne` | listbox "List of suggested destinations" with options "Melbourne CBD …", "Melbourne Victoria (Melbourne Region), Australia", … (last option "Melbourne Search with AI") |
| 4a | click first option "Melbourne CBD …" | combobox value set → Search → `/searchresults`, region "Filters", date picker open (run) |
| 4b | click option "Melbourne Victoria …" | combobox value set → Search → `/city/au/melbourne.html` (cdt) |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| signInModal | `page.getByRole('dialog', { name: /sign in to Booking\.com/ })` | cdt | |
| dismissSignIn | `page.getByRole('button', { name: 'Dismiss sign-in info.' })` | cdt | |
| searchForm | `page.getByRole('region', { name: 'Search properties' })` | cdt | |
| destinationInput | `searchForm.getByRole('combobox')` | cdt + run | Name varies by A/B variant, so match by role only |
| suggestions | `page.getByRole('listbox', { name: /List of suggested destinations/ })` | cdt + run | Named "Trending destinations" while the input is empty |
| suggestion(text) | `suggestions.getByRole('option', { name: /^Melbourne\b/ }).filter({ hasNotText: 'Search with AI' }).first()` | cdt + run | |
| searchButton | `searchForm.getByRole('button', { name: 'Search', exact: true })` | cdt + run | |
| filters | `page.getByRole('region', { name: 'Filters' })` | run | Results page marker; checkboxes like "Hotels: 100 properties" |
| cityHeading | `page.getByRole('heading', { level: 2, name: /^Melbourne – \d+ hotels/ })` | cdt | City landing page only |
| propertyCards | `page.getByTestId('property-card')` | not verified | `data-testid` isn't in the a11y snapshot; not used by the POM |

## Gaps
- Date picker and occupancy flows are not mapped. They're needed to reach `/searchresults`.
