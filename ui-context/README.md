# UI context

Saved UI knowledge for every site LatteQ tests. Built with the **chrome-devtools CLI**, then mapped to Playwright locators, so page objects and specs can be written **without re-crawling** the site.

How to use, refresh and extend these maps: `.claude/skills/ui-context/SKILL.md`. How to drive the CLI: `.claude/skills/chrome-devtools-cli/SKILL.md`.

| Site | Map | Captured | Last verified by run | Notes |
|---|---|---|---|---|
| datatables | [MAP.md](datatables/MAP.md) | 2026-10-04 | 2026-10-04 | Header vs footer column cells |
| uitp | [MAP.md](uitp/MAP.md) | 2026-10-04 | 2026-10-04 | Needs `--acceptInsecureCerts` |
| mui | [MAP.md](mui/MAP.md) | 2026-10-04 | 2026-10-04 | 16 "Age" comboboxes; portal listbox |
| highcharts | [MAP.md](highcharts/MAP.md) | 2026-10-04 | 2026-10-04 | Chart in iframe; inner locators are `run`-verified |
| github | [MAP.md](github/MAP.md) | 2026-10-04 | 2026-10-04 | Hydration race; issue filter ignores fill() |
| booking | [MAP.md](booking/MAP.md) | 2026-10-04 | 2026-10-04 | Real Chrome only (`channel: 'chrome'`); A/B destination box; sign-in modal |

## Commands

```bash
npm run ui:cdt -- start --headless --isolated --acceptInsecureCerts --no-usage-statistics --no-performance-crux
npm run ui:cdt -- new_page "<url>"
npm run ui:snap -- <site> <state>                                  # save sanitized snapshot
npm run ui:map -- ui-context/<site>/<state>.snapshot.txt           # Playwright locator candidates
npm run ui:cdt -- stop
```
