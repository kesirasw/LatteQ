# LatteQ - Playwright Practice Framework

## 🎯 Project Setup Complete!

This is a comprehensive Playwright automation practice framework based on your requirements. It includes real-world practice scenarios, helper utilities, page objects, and fixtures.

---

## 📁 Project Structure

```
LatteQ/
├── playwright.config.ts          # Main Playwright configuration
├── package.json                  # Dependencies & scripts
│
├── fixtures/
│   └── test.ts                   # Custom Playwright fixtures with all pages & utils
│
├── utils/
│   ├── actions.ts                # Safe click/type/fill operations with auto-waits
│   ├── waits.ts                  # DOM settlement helpers
│   ├── table.ts                  # Table parsing & sorting validation
│   ├── network.ts                # Network interception utilities
│   └── auth.ts                   # StorageState helpers for auth reuse
│
├── pages/
│   ├── DataTablesPage.ts         # DataTables (filter/sort/pagination)
│   ├── BookingPage.ts            # Booking.com (complex forms)
│   ├── GitHubPage.ts             # GitHub (SPA + dynamic content)
│   ├── UITestingPlaygroundPage.ts # UITP (automation edge cases)
│   ├── MUIPage.ts                # Material UI (portal dropdowns)
│   └── HighchartsPage.ts         # Highcharts (chart interactions)
│
├── tests/
│   ├── example.spec.js           # Initial example test
│   └── practice/
│       ├── 01_tables_datatables.spec.ts       # Table filtering, sorting
│       ├── 02_forms_booking.spec.ts           # Complex form flows
│       ├── 03_spa_github.spec.ts              # SPA navigation + filtering
│       ├── 04_playground_uitp.spec.ts         # Dynamic IDs, load delays
│       ├── 05_components_mui.spec.ts          # Portal-based dropdowns
│       ├── 06_charts_highcharts.spec.ts       # Chart interactions
│       └── 07_auth_storageState.spec.ts       # Auth state reuse pattern
│
└── data/
    └── env.ts                    # Centralized test data & URLs
```

---

## 🚀 Quick Start

### Install dependencies (already done)
```bash
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run only practice tests
```bash
npm run test:practice
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug a single test
```bash
npm run test:debug
```

---

## 💡 What Each Test Covers

### 1️⃣ **DataTables** (Tables, Filtering, Sorting, Pagination)
- **Target**: https://datatables.net/
- **Skills**: Table parsing, sorting validation, dynamic row selection
- **File**: `01_tables_datatables.spec.ts`

### 2️⃣ **Booking.com** (Complex Forms, Date Pickers, Auto-suggest)
- **Target**: https://www.booking.com
- **Skills**: Multi-step forms, auto-complete inputs, conditional fields
- **File**: `02_forms_booking.spec.ts`

### 3️⃣ **GitHub** (SPA, Dynamic Content, Pagination)
- **Target**: https://github.com
- **Skills**: Search, filtering, repo navigation, issue tracking
- **File**: `03_spa_github.spec.ts`

### 4️⃣ **UI Testing Playground** (Automation Edge Cases)
- **Target**: https://uitestingplayground.com
- **Skills**: Dynamic IDs, load delays, race conditions, hidden elements
- **File**: `04_playground_uitp.spec.ts`

### 5️⃣ **Material UI** (Portal Dropdowns, Complex Components)
- **Target**: https://mui.com/material-ui/react-select/
- **Skills**: Portal-based elements, role-based selectors, accessibility
- **File**: `05_components_mui.spec.ts`

### 6️⃣ **Highcharts** (Chart Interactions, Hover, Tooltips)
- **Target**: https://www.highcharts.com/demo
- **Skills**: Hover interactions, DOM-based assertions, legend toggling
- **File**: `06_charts_highcharts.spec.ts`

### 7️⃣ **Auth + StorageState** (Session Reuse Pattern)
- **Target**: GitHub login (template)
- **Skills**: Authentication reuse, storageState, test isolation
- **File**: `07_auth_storageState.spec.ts`

---

## 🛠️ Utility & Helper Functions

### `Actions` class
Safe, retry-aware operations:
- `safeClick()` - Click with visibility + enabled checks
- `safeFill()` - Type with auto-clear
- `safeType()` - Type with delay (human-like)
- `safePress()` - Press keys
- `stableNavigate()` - Robust page navigation

### `Network` class
Intercept & validate API calls:
- `waitForResponseContains()` - Catch specific API responses
- `captureJson()` - Intercept JSON responses with action trigger

### Table utilities
- `getColumnText()` - Extract column values from tables
- `isSortedAsc()` - Check if values are sorted ascending
- `expectSortedAsc()` - Assert sorting with error message

### Auth utilities
- `authStateExists()` - Check if session is cached
- `saveStorageState()` - Save browser cookies/localStorage for reuse

---

## 🎨 Page Object Model (POM) Pattern

Each page inherits utilities:
```typescript
const booking = new BookingPage(page, actions);
await booking.open();
await booking.setDestination('Melbourne');
await booking.clickSearch();
```

This pattern ensures:
- ✅ Reusable selectors
- ✅ Stable, role-based locators
- ✅ Clear test intent
- ✅ Easy maintenance

---

## 🧪 Fixture Injection

All tests get fixtures injected automatically:

```typescript
test('Example', async ({ 
  booking,    // BookingPage instance
  github,     // GitHubPage instance
  actions,    // Actions helper
  network,    // Network interception
  page        // Raw Playwright page
}) => {
  // Use fixtures...
});
```

---

## ⚙️ Configuration Best Practices

From `playwright.config.ts`:
- ✅ **Screenshot on failure** - Visual debugging
- ✅ **Video on failure** - See what went wrong
- ✅ **Trace on first retry** - Deep debugging with browser trace
- ✅ **Timeout: 60s** - Realistic for complex scenarios
- ✅ **Retries: 1** - Catch flaky tests
- ✅ **Parallel: true** - Fast feedback
- ✅ **HTML reporter** - Nice test reports

---

## 📊 14-Day Practice Roadmap

**Week 1:**
- Day 1-2: DataTables (tables, sorting, pagination)
- Day 3-4: Booking.com (forms, date pickers)
- Day 5-6: GitHub (search, filters, infinite scroll)
- Day 7: UI Testing Playground (edge cases)

**Week 2:**
- Day 8-9: MUI Select/Autocomplete (portals, keyboard)
- Day 10: Reddit-like (infinite scroll, lazy loading)
- Day 11-12: Highcharts (hover, tooltips, interactions)
- Day 13: Auth + StorageState patterns
- Day 14: Build a mini framework (fixtures + reporting)

---

## 🚨 Best Practices Applied

✅ **No hard waits** - `waitForTimeout()` avoided  
✅ **Role-based locators** - `getByRole()` preferred over CSS/XPath  
✅ **User-visible assertions** - `toBeVisible()`, `toHaveText()`, etc.  
✅ **Stable selectors** - role > label > testid > text > css > xpath  
✅ **Auto-retry logic** - Built into `safeClick()`, `safeFill()`, etc.  
✅ **Network validation** - Test via APIs, not brittle UI assertions  
✅ **Session reuse** - StorageState for faster auth flows  

---

## 📚 Next Steps

1. **Run the tests:**
   ```bash
   npm test
   ```

2. **Check test results:**
   - HTML report: `playwright-report/` (auto-generated after run)
   - Traces: `.playwright/trace/` (on retry)

3. **Extend with your own tests:**
   - Copy a POM template
   - Extend `UITestingPlaygroundPage` or create a new one
   - Add tests to `tests/practice/`

4. **Practice adding new scenarios:**
   - Try automating Reddit's infinite scroll
   - Build helpers for your use cases
   - Experiment with canvas-based apps (TradingView, Highcharts)

---

## 🎓 Learning Outcomes

After working through these tests, you'll master:

- ✅ Page Object Model (POM) design
- ✅ Fixture-based test organization
- ✅ Safe, flaky-resistant automation patterns
- ✅ Network interception & API validation
- ✅ Complex component interaction (portals, dropdowns, date pickers)
- ✅ Auth reuse via StorageState
- ✅ Table parsing & validation
- ✅ Chart/canvas interaction strategies
- ✅ Real-world SPA automation
- ✅ Playwright best practices at scale

---

## 📞 Troubleshooting

**Tests timing out?**
- Increase `timeout` in `playwright.config.ts`
- Check network speed (international sites may be slow)

**Selectors breaking?**
- Use `page.locator()` inspector in headed mode
- Inspect element with DevTools
- Switch to role-based selectors

**Flaky tests?**
- Use `actions.safeClick()` instead of raw `.click()`
- Avoid hard waits
- Prefer network-based assertions

---

**Happy automating! 🎉**
