---
name: debugging
description: Failure investigation for LatteQ Playwright tests — capture (error, trace, screenshot, video), classify against the failure taxonomy (selector ambiguity, overlay interception, late rendering, cert/network, site change, bot wall, test bug), fix the root cause without bumping timeouts or swallowing errors, and record real-site fixes in TEST_FIXES_KNOWLEDGE_BASE.md. Load whenever a test fails, times out, is flaky, or the user says "fix this test" / "why is this red".
---

# Debugging

## Critical

- **Capture before you change anything.** Read the full error, then the trace. Never "try a fix and see".
- **Fix the cause, not the symptom.** Forbidden "fixes": raising timeouts, `waitForTimeout`, `.catch(() => {})`, `force: true` without diagnosis, `.first()` to silence strict mode, `test.skip` without a reason, deleting the assertion.
- **Check the knowledge base first.** `TEST_FIXES_KNOWLEDGE_BASE.md` already covers strict-mode ambiguity, overlays, SSL, multiple headings, chart render timing and auth state.
- **Third-party site down or blocking you?** Say so plainly. Mark `test.fixme(true, '<site>: <what you saw> <date>')` only after the user agrees.
- **Record it.** Every new real-site root cause gets a knowledge-base entry in the existing format (Problem / Root Cause / Solution / Code Change / Key Learning).

## 1. Capture

```bash
npx playwright test <file> --reporter=list          # reproduce, read the full error
npx playwright test <file> --trace on               # force a trace
npx playwright show-trace test-results/<dir>/trace.zip
npx playwright test <file> --headed --debug         # step through (Inspector)
npx playwright test <file> --repeat-each 5          # check flakiness
```

With the MCP server: `test_run` → `test_debug` pauses at the failure; then `browser_snapshot`, `browser_console_messages`, `browser_network_requests`, `browser_generate_locator` against the paused page.

## 2. Classify

| Symptom | Category | Fix direction | KB |
|---------|----------|---------------|----|
| `strict mode violation … resolved to N elements` | Selector ambiguity | `exact: true`, scope, `filter` (`selectors`) | §1, §5 |
| `<div …> intercepts pointer events` | Overlay / modal | Dismiss the overlay; last resort documented `force: true` or keyboard input | §2, §3 |
| `waiting for locator…` timeout, element appears later | Late render / SPA | Wait for the right signal: locator assertion, `waitForURL`, `Network.waitForResponseContains` | §6 |
| `net::ERR_CERT_*` | Cert / network | Global `ignoreHTTPSErrors` (already on) | §4 |
| Locator not found, page looks different in screenshot | Site changed | Re-explore, update the page object | — |
| Captcha, "unusual traffic", empty results only in CI | Bot wall | Report to user; `@flaky-site` tag or `fixme` with reason | — |
| Passes alone, fails in parallel | Shared state | Isolate via fixture / storageState | §7 |
| Wrong value asserted, logic error | Test bug | Fix the test or page method | — |

## 3. Fix

- Make the smallest change in the **page object** (locator or wait), not the spec, unless the spec's assertion is wrong.
- If the right wait is a network response, use the `Network` fixture:
  ```ts
  await network.waitForResponseContains('/search', { status: 200 });
  ```
- Leave a short comment when the fix exists because of site behaviour (`// GitHub search modal intercepts pointer events while animating`).

## 4. Verify

- Run the test 3+ times: `npx playwright test <file> --repeat-each 3`. Report pass/fail counts honestly.
- Run `npm run verify`.

## 5. Record

Append to `TEST_FIXES_KNOWLEDGE_BASE.md` under "Test Failures & Solutions" with the next number:

```md
### N. <Site> Test - <Short problem name>

**File**: `tests/practice/NN_….spec.ts`
**POM**: `pages/XxxPage.ts`

#### Problem
<error excerpt>

#### Root Cause
<why it happens>

#### Solution
<what changed>

#### Code Change
<before/after>

#### Key Learning
- <bullet>
```
