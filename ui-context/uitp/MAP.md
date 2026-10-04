# UI Testing Playground — UI map

| | |
|---|---|
| Base URL | `ENV.UITP_URL` (`https://uitestingplayground.com/`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome |
| Snapshots | `home` · `dynamic-id` · `load-delay` |
| Used by | `pages/UITestingPlaygroundPage.ts` · `tests/practice/04_playground_uitp.spec.ts` |
| Last verified by run | 2026-10-04 (04 spec 3/3) |

## Quirks
- **Certificate:** `NET::ERR_CERT_COMMON_NAME_INVALID` in real Chrome. Start the CLI with `--acceptInsecureCerts`. Playwright gets past it via `ignoreHTTPSErrors: true` in config (KB §4).
- The home page lists ~20 scenarios, each a `link` inside a level-3 `heading` with the same name.
- The Load Delay page's own heading is **"Load Delays"** (plural); the home link is "Load Delay".

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open home | heading "UI Test Automation Playground" (level 1) |
| 2 | click link "Dynamic ID" | URL `/dynamicid`, heading "Dynamic ID" (level 3) |
| 3 | click button "Button with Dynamic ID" | button focused (no other visible change) |
| 4 | click link "Load Delay" | page responds slowly; heading "Load Delays", button "Button Appearing After Delay" |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| homeHeading | `page.getByRole('heading', { name: 'UI Test Automation Playground' })` | cdt | |
| scenarioLink(name) | `page.getByRole('link', { name: '<name>' })` | cdt | e.g. "Dynamic ID", "Load Delay", "Class Attribute", "Hidden Layers" |
| dynamicIdButton | `page.getByRole('button', { name: 'Button with Dynamic ID' })` | cdt | id changes every load; role+name is stable |
| delayedButton | `page.getByRole('button', { name: 'Button Appearing After Delay' })` | cdt | |
| scenarioHeading | `page.getByRole('heading', { name: '<title>', exact: true })` | cdt | Unique on each scenario page today (`ui:map`). The POM keeps `exact` defensively |

## Gaps
- The remaining scenarios (Class Attribute, Hidden Layers, AJAX Data, Client Side Delay, Click, Text Input, Scrollbars, …) are listed on `home` but not mapped. Their links are in `home.snapshot.txt`; crawl each scenario page when a test needs it.
