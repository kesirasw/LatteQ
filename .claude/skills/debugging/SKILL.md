---
name: debugging
description: Failure investigation for LatteQ Playwright tests — capture (error, trace, screenshot, video), classify against the failure taxonomy (selector ambiguity, overlay interception, late rendering, cert/network, site change, bot wall, product defect, test bug), run the bug oracle (is the product or the test wrong? requirement → contract → plan → heuristics, never current behaviour), heal broken locators with the assisted-healing procedure (npm run heal:suggest, map refresh, human gate — never runtime self-healing), fix the root cause without bumping timeouts or swallowing errors, and record what was learned (KB, docs/DEFECTS.md, MAP.md). Load whenever a test fails, times out, is flaky, a locator broke after a site change, or the user says "fix this test" / "why is this red" / "is this a bug?" / "heal this test".
---

# Debugging

## Critical

- **Capture before you change anything.** Read the full error, then the trace. Never "try a fix and see".
- **Red is not automatically the test's fault.** Before editing an assertion, expected text or test data, run the bug oracle (§3). Changing the expectation to match what the site does now is forbidden.
- **Fix the cause, not the symptom.** Forbidden "fixes": raising timeouts, `waitForTimeout`, `.catch(() => {})`, `force: true` without diagnosis, `.first()` to silence strict mode, `test.skip` without a reason, deleting the assertion.
- **Check the knowledge base first.** `docs/TEST_FIXES_KNOWLEDGE_BASE.md` already covers strict-mode ambiguity, overlays, SSL, multiple headings, chart render timing and auth state.
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

To compare against the live site, use the chrome-devtools CLI (`chrome-devtools-cli`), not Playwright MCP: open the failing state, `take_snapshot`, `list_console_messages`, `list_network_requests`. Diff the result against the state's file in `ui-context/<site>/`. The Playwright trace's `error-context.md` also contains an accessibility snapshot of the moment of failure.

## 2. Classify

| Symptom | Category | Fix direction | KB |
|---------|----------|---------------|----|
| `strict mode violation … resolved to N elements` | Selector ambiguity | `exact: true`, scope, `filter` (`selectors`) | §1, §5 |
| `<div …> intercepts pointer events` | Overlay / modal | Dismiss the overlay; last resort documented `force: true` or keyboard input | §2, §3 |
| `waiting for locator…` timeout, element appears later | Late render / SPA | Wait for the right signal: locator assertion, `waitForURL`, `Network.waitForResponseContains` | §6 |
| `net::ERR_CERT_*` | Cert / network | Global `ignoreHTTPSErrors` (already on) | §4 |
| Locator not found, page looks different in screenshot | Site changed | Bug oracle (§3) first, then assisted healing (§5) | — |
| Page behaves wrongly against the plan / contract / requirement (missing message, wrong status, untranslated text, wrong total) | Product defect | Don't touch the expectation: register in `docs/DEFECTS.md`, `test.fail(true, 'DEF-NNN: …')` (§3) | — |
| Works in the CLI's Chrome, fails in Playwright (or vice versa) | Browser variant | Note it in the map's Quirks (A/B copy, locale, CORS); consider `channel: 'chrome'` | §8, §10 |
| Captcha, "unusual traffic", empty results only in CI | Bot wall | Report to user; `@flaky-site` tag or `fixme` with reason | — |
| Passes alone, fails in parallel | Shared state | Isolate via fixture / storageState | §7 |
| Wrong value asserted, logic error | Test bug | Fix the test or page method | — |

## 3. Bug oracle — is the product wrong, or the test?

Decide **before** changing anything except capture. Sources, strongest first:

| # | Oracle | Where | Use for |
|---|--------|-------|---------|
| 1 | Requirement | What the user / ticket / acceptance criteria state | Anything it covers |
| 2 | Contract | `api-context/<site>/openapi.json` | API status codes, bodies, fields |
| 3 | Test plan | Expected result of the case in `test-plans/<site>/` | UI and API behaviour |
| 4 | Heuristics | Consistency with the rest of the site, readable text (no raw keys), errors explained, no data leaks, totals add up | Gaps in 1–3. A heuristic alone gives **Suspected**, never Confirmed |
| — | `ui-context` map | `MAP.md` | **Structure and locators only.** "Observed outcome" records what the site did, not what it should do |
| ✗ | Current behaviour | What the test got this run | **Never** proof that the site is right |

Then classify:

| Verdict | Signs | Action |
|---------|-------|--------|
| **Test bug** | The test or page object contradicts the oracle | Fix the test (§4) |
| **Environment** | Network, bot wall, shared-demo load, leftover data; passes when re-run in isolation | Fix isolation/waits (§4), KB entry |
| **Intended change** | The site changed on purpose and consistently (new label everywhere, release note, user confirms) | Assisted healing (§5). If an expected result changes, update the **plan first** with the reason, then the test |
| **Product defect** | Breaks oracle 1–3 | Register `DEF-NNN` in `docs/DEFECTS.md` (status Suspected), keep the correct expectation, `test.fail(true, 'DEF-NNN: …')` (UI) or `test.skip` + `// FIXME: DEF-NNN` (API, `api-testing`). Add it to the plan's suspected defects |
| **Suspected defect** | Breaks only a heuristic | Same as product defect, status Suspected; tell the user it needs confirming |
| **Can't tell** | Oracles silent or conflicting | **Stop and ask.** Don't pick the answer that makes the test green |

Before registering a defect, make it fail for the right reason: run once without `test.fail`/`skip` and check the error is the stated one, not leftover data or load (KB §15).

When a `test.fail` test **passes**, Playwright reports it as failed ("expected to fail, but passed"): the defect is probably fixed. Confirm on the site, remove `test.fail`, set the register row to Fixed.

## 4. Fix

- Make the smallest change in the **page object** (locator or wait), not the spec, unless the spec's assertion is wrong.
- If the right wait is a network response, use the `Network` fixture:
  ```ts
  await network.waitForResponseContains('/search', { status: 200 });
  ```
- Leave a short comment when the fix exists because of site behaviour (`// GitHub search modal intercepts pointer events while animating`).

## 5. Assisted healing (broken locators)

LatteQ heals locators **with an agent and a human gate, never at runtime** ([decision 006](../../../docs/decisions/006-bug-oracle-and-assisted-healing.md)). No fallback locator chains, no `.or()` to "try alternatives", no picking whatever element is there now.

1. **Trigger:** a test that was green fails with "element not found", "waiting for locator…" or a new strict-mode violation.
2. **Suggest** from the failure snapshot Playwright saved (no crawl needed):
   ```bash
   npm run heal:suggest -- test-results/<failed-test-dir> --locator "getByRole('button', { name: 'Place order' })"
   ```
   It ranks candidates by role and name similarity and says when the element is actually **unchanged** (then it's timing, an overlay or ambiguity: back to §2, don't heal).
3. **Oracle check:** a candidate whose **visible name changed** ("Place order" → "Submit") is a §3 question. Heal only on *Intended change*.
4. **Confirm** with a chrome-devtools CLI snapshot of the same state (`ui-context`): the failure snapshot is one moment on one run.
5. **Patch** the locator in the page object only (specs untouched), and the row in `MAP.md` (`Source: cdt`, then `cdt + run` after a green run).
6. **Ask for approval:** show the user the old → new locator and the evidence (failure snapshot, CLI snapshot, oracle result). Keep the change only if they approve; otherwise revert it.
7. **Verify** (§6) and **record** (§7).

Limits: heal locators only, never assertions, expected text or test data. Three or more broken locators on one page = redesign: re-crawl that state and review the page object as a whole.

## 6. Verify

- Run the test 3+ times: `npx playwright test <file> --repeat-each 3`. Report pass/fail counts honestly.
- Run `npm run verify`.

## 7. Record

| What you learned | Where it goes |
|------------------|---------------|
| A site- or environment-caused failure and its fix | `docs/TEST_FIXES_KNOWLEDGE_BASE.md` (format below) + a row in its Index |
| A product defect | `docs/DEFECTS.md` + the plan's suspected defects |
| A healed locator / changed UI | `ui-context/<site>/MAP.md` (row + captured date) |
| A choice between real alternatives (e.g. "lower workers instead of retries") | `docs/decisions/` |

Append to `docs/TEST_FIXES_KNOWLEDGE_BASE.md` under "Test Failures & Solutions" with the next number:

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
