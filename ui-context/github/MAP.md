# GitHub (logged out) — UI map

| | |
|---|---|
| Base URL | `ENV.GITHUB_URL` (`https://github.com/`) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome |
| Snapshots | `home` · `home.quick-search-open` · `search-results` · `repo` · `issues` · `login` |
| Used by | `pages/GitHubPage.ts` · `tests/practice/03_spa_github.spec.ts` · `07_auth_storageState.spec.ts` |
| Last verified by run | 2026-10-04 (03 spec 5/5 in parallel) |

## Quirks
- The header search is a **button** ("Search or jump to, type / to search") that opens the dialog "Quick search". The old placeholder-based locator no longer exists.
- **Hydration race:** search results and the issues page re-render after first paint. Clicks and typing that land early are lost under load. Retry the action until the URL changes, using `expect(...).toPass()` (KB §9).
- The issue filter combobox **ignores `fill()`**: use select-all + `pressSequentially`, then submit with the form's Search button.
- Search ranking moves: `microsoft playwright` does not list microsoft/playwright on page 1; `playwright` lists it first.
- Two navs share the "Repository" prefix on the repo page ("Repository", "Repository files"): use `exact: true`.
- `list "Issues"` vs `list "Filter issues by state"`: use `exact: true`.

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| 1 | open home | button "Search or jump to…", link "Sign in" in banner |
| 2 | click search button | dialog "Quick search" with combobox "Search or jump to" |
| 3 | fill `playwright` + Enter | URL `/search?q=playwright&type=repositories`; results are level-3 headings with links "owner/repo" |
| 4 | click link "microsoft/playwright" | URL `/microsoft/playwright`; nav "Repository" with "Code", "Issues N", "Pull requests N", … |
| 5 | click "Issues N" | URL `/issues`; combobox "Search issues" = `is:issue state:open` |
| 6 | type filter, click form Search | URL `?q=<filter>`; list "Issues" updates |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| searchButton | `page.getByRole('button', { name: /^Search or jump to/ })` | cdt | |
| searchInput | `page.getByRole('dialog', { name: 'Quick search' }).getByRole('combobox', { name: 'Search or jump to' })` | cdt | |
| results | `page.getByTestId('results-list').getByRole('heading', { level: 3 })` | cdt + run | `data-testid` isn't in the a11y snapshot; confirmed by run |
| repoResult(name) | `results.getByRole('link', { name: '<owner/repo>', exact: true })` | cdt | |
| repoNav | `page.getByRole('navigation', { name: 'Repository', exact: true })` | cdt | |
| issuesTab | `repoNav.getByRole('link', { name: /^Issues/ })` | cdt | Name includes the count, e.g. "Issues 189" |
| issueFilter | `page.getByRole('combobox', { name: 'Search issues' })` | cdt | Custom React input, see quirks |
| issueFilterSubmit | `page.getByRole('form', { name: 'Search issues' }).getByRole('button', { name: 'Search', exact: true })` | cdt | |
| issues | `page.getByRole('list', { name: 'Issues', exact: true }).getByRole('listitem')` | cdt | |
| signInLink | `page.getByRole('banner').getByRole('link', { name: 'Sign in', exact: true })` | cdt | Hidden when logged in |
| loginUser / loginPass / loginSubmit | `getByRole('textbox', { name: 'Username or email address' })` / `{ name: 'Password' }` / `getByRole('button', { name: 'Sign in', exact: true })` | cdt (`login`) | |

## Data
- Labels with open issues on microsoft/playwright (2026-10-04): `P3-collecting-feedback` (113), `v1.65` (23), `feature-test-runner` (10), `browser-webkit` (9). There is **no `bug` label**.

## Gaps
- Logged-in states (user menu, notifications) are not mapped: they need credentials.
