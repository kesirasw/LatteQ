# Highcharts demos — UI map

| | |
|---|---|
| Base URL | `ENV.HIGHCHARTS_URL` (`https://www.highcharts.com/demo`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome |
| Snapshots | `demo-index` · `line-chart` |
| Used by | `pages/HighchartsPage.ts` · `tests/practice/06_charts_highcharts.spec.ts` |
| Last verified by run | 2026-10-04 (06 spec 3/3) |

## Quirks
- **Cookie banner** ("This site uses cookies") overlays the page. Click "Reject all" first. The chart does not render until consent is given.
- **Chart lives in an iframe** titled `Highcharts <Demo name> demo` (srcdoc). **The CLI snapshot does not descend into iframes**, so everything inside the chart is `run`-verified (Playwright), not `cdt`.
- In the CLI's headless Chrome the chart scripts were **blocked by CORS** (`code.highcharts.com/esm/*.js`), so the chart never rendered there. The site's script loading differs between browsers. Playwright's Chromium renders it fine.
- Point names are **locale-formatted**: `Thursday 1 Jan, 03:00, 1,048. Users.` (en-GB) vs `Thursday, Jan 1, 03:00 AM, 1,048. Users.` (en-US, the test runner). Match the stable part with a regex.
- Point markers have opacity 0, and the tooltip opens on mouse *movement*: hover twice at different offsets (KB §10).
- "Line chart" appears 3× on the index (Overview tile, Highcharts Core section, sidebar). Scope to region "Overview".

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open index | cookie banner + heading "Highcharts Demos" |
| 2 | click button "Reject all" | banner gone |
| 3 | click "Line chart" in region "Overview" | URL `/demo/highcharts/line-chart`, iframe "Highcharts Line chart demo" |
| 4 | hover point 03:00 (Users) | SVG tooltip "03:00 → 03:59 · Users 1,048 · Average 728" |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| rejectCookies | `page.getByRole('button', { name: 'Reject all' })` | cdt | |
| indexHeading | `page.getByRole('heading', { name: 'Highcharts Demos', exact: true })` | cdt | |
| overviewTile(name) | `page.getByRole('region', { name: 'Overview' }).getByRole('link', { name: '<name>' })` | cdt | Line chart, Column chart, Bar chart, Pie chart, Donut chart, Gauge, … |
| chartFrame | `page.getByTitle(/^Highcharts .* demo$/).contentFrame()` | cdt (iframe node) | |
| chart | `chartFrame.getByRole('region', { name: /Highcharts interactive chart/ })` | run | |
| point(pattern) | `chartFrame.getByRole('img', { name: /03:00.*, 1,048\. Users\.$/ })` | run | Two series: "Users", "Average"; 24 hourly points each |
| tooltip | `chartFrame.locator('.highcharts-tooltip')` | run | SVG, no role. Read with `textContent`, not `innerText` |

## Gaps
- No legend on the line chart (the old `toggleFirstLegendItem` was removed).
- Other demos (column, pie, …) are not mapped. Their iframe titles follow the same pattern.
