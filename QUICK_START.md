# LatteQ Framework - Quick Reference

## ✅ What's Installed & Set Up

- ✅ Playwright v1.57.0 with all browsers (Chromium, Firefox, WebKit)
- ✅ TypeScript support ready
- ✅ 7 practice test suites (12 tests total)
- ✅ Page Object Models (POMs) for 6 major websites
- ✅ Reusable helper utilities & fixtures
- ✅ Playwright best practices baked in

---

## 🎯 Test Categories

| # | Category | Target Site | File | Skills |
|---|----------|------------|------|--------|
| 1 | Tables | DataTables.net | `01_tables_datatables.spec.ts` | Filter, sort, pagination |
| 2 | Forms | Booking.com | `02_forms_booking.spec.ts` | Date pickers, auto-suggest |
| 3 | SPA | GitHub | `03_spa_github.spec.ts` | Dynamic content, search |
| 4 | Edge Cases | UI Testing Playground | `04_playground_uitp.spec.ts` | Dynamic IDs, load delays |
| 5 | Components | Material UI | `05_components_mui.spec.ts` | Portals, dropdowns |
| 6 | Charts | Highcharts | `06_charts_highcharts.spec.ts` | Hover, tooltips, interactions |
| 7 | Auth | GitHub Login | `07_auth_storageState.spec.ts` | Session reuse, StorageState |

---

## 🏃 Common Commands

```bash
# Run all tests
npm test

# Run only practice tests
npm run test:practice

# Run in UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug a specific test
npm run test:debug

# Run single test file
npm test tests/practice/01_tables_datatables.spec.ts
```

---

## 📂 File Guide

### Pages (Page Objects)
- `pages/DataTablesPage.ts` - Table interactions
- `pages/BookingPage.ts` - Form workflows
- `pages/GitHubPage.ts` - Search + filtering
- `pages/UITestingPlaygroundPage.ts` - Edge case scenarios
- `pages/MUIPage.ts` - Complex components
- `pages/HighchartsPage.ts` - Chart interactions

### Utils (Helpers)
- `utils/actions.ts` - Safe click/type with auto-retries
- `utils/waits.ts` - DOM settlement helpers
- `utils/table.ts` - Table parsing utilities
- `utils/network.ts` - API interception
- `utils/auth.ts` - Session/StorageState helpers

### Tests
- `tests/practice/01-07_*.spec.ts` - Practice test suites
- `tests/example.spec.js` - Basic example (keep or replace)

### Config
- `playwright.config.ts` - Playwright settings (trace, screenshots, video)
- `fixtures/test.ts` - Custom fixtures (page objects + utilities)
- `data/env.ts` - Test data & URLs

---

## 💻 Using Fixtures in Tests

```typescript
// Fixtures are auto-injected
test('Example', async ({ 
  booking,     // BookingPage instance
  github,      // GitHubPage instance  
  datatables,  // DataTablesPage instance
  uitp,        // UITestingPlaygroundPage instance
  mui,         // MUIPage instance
  highcharts,  // HighchartsPage instance
  actions,     // Actions helper
  network,     // Network interception
  page         // Raw Playwright page
}) => {
  // All fixtures ready to use!
});
```

---

## 🛠️ Actions Helper (Most Used)

```typescript
// Safe, auto-retry operations
await actions.safeClick(locator);              // Click with checks
await actions.safeFill(locator, 'text');       // Type with auto-clear
await actions.safeType(locator, 'text');       // Type with delay
await actions.safePress(locator, 'Enter');     // Press key
await actions.stableNavigate('https://...');   // Navigate safely
```

---

## 📊 Test Results

After running tests:
- 📄 **HTML Report**: `playwright-report/index.html`
- 🎬 **Videos**: `test-results/` (on failure)
- 🔍 **Traces**: `.playwright/trace/` (on retry)

---

## 🎓 Practice Path (14 Days)

**Week 1:**
- Days 1-2: Master tables & sorting (DataTables)
- Days 3-4: Complex forms & date pickers (Booking)
- Days 5-6: SPA & dynamic content (GitHub)
- Day 7: Edge cases & flaky handling (UITP)

**Week 2:**
- Days 8-9: Portal dropdowns & a11y (MUI)
- Days 10-11: Lazy loading & infinite scroll (extend)
- Days 12-13: Chart interactions & network validation (Highcharts)
- Day 14: Build your own framework extension

---

## 🚀 Next: Extend the Framework

### Add a new page object:
```typescript
// pages/MyNewPage.ts
export class MyNewPage {
  constructor(private readonly page: Page, private readonly actions: Actions) {}
  
  async open() {
    await this.actions.stableNavigate('https://example.com');
  }
  
  async doSomething() {
    // Use actions helper
    await this.actions.safeClick(this.page.locator('button'));
  }
}
```

### Add it to fixtures:
```typescript
// fixtures/test.ts
import { MyNewPage } from '../pages/MyNewPage';

export const test = base.extend<Fixtures>({
  // ... existing ...
  mynew: async ({ page, actions }, use) => 
    await use(new MyNewPage(page, actions)),
});
```

### Use in tests:
```typescript
test('My test', async ({ mynew }) => {
  await mynew.open();
  await mynew.doSomething();
});
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | ↑ Increase timeout in `playwright.config.ts` |
| Selector breaks | Use role-based locators: `getByRole()` |
| Flaky tests | Use `actions.safeClick()` instead of `.click()` |
| Network slow | Check international site speeds |
| Auth needed | Set `GH_USER` & `GH_PASS` env vars |

---

## 📞 Useful Resources

- Playwright Docs: https://playwright.dev
- Best Practices: https://playwright.dev/docs/best-practices
- Locators Guide: https://playwright.dev/docs/locators

---

**You're all set! 🚀 Start with `npm run test:practice` to see it in action.**
