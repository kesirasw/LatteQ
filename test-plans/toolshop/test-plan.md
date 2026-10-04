# Test plan — Practice Software Testing (Toolshop)

| | |
|---|---|
| Website | https://practicesoftwaretesting.com (Toolshop, version 5) |
| Based on | Exploration on 2026-10-04. See `ui-context/toolshop/MAP.md` |
| Status | Draft, for review before automation |
| Last updated | 2026-10-04 |

## 1. Purpose

Toolshop is a complete online hardware shop built for practising software testing. We'll test it end to end: finding products, buying them as a customer or a guest, managing an account and contacting the shop. This proves LatteQ's full workflow (explore, plan, automate, check, debug) on a realistic web application.

## 2. What we will test

| Area | What it covers | Test cases |
|---|---|---|
| Browsing and search | Product list, search, sorting, filters, pages | [01-browsing-and-search.md](test-cases/01-browsing-and-search.md) |
| Product details | Product information, quantity, cart, favourites, related products | [02-product-details.md](test-cases/02-product-details.md) |
| Shopping cart | Items, totals, changing quantities, removing items | [03-shopping-cart.md](test-cases/03-shopping-cart.md) |
| Checkout and payment | Sign in or guest, billing address, five payment methods, placing an order | [04-checkout-and-payment.md](test-cases/04-checkout-and-payment.md) |
| Login and account | Signing in and out, registering, password reset, account area | [05-login-and-account.md](test-cases/05-login-and-account.md) |
| Contact form | Required fields, attachments, sending a message | [06-contact-form.md](test-cases/06-contact-form.md) |
| Backend checks | The business rules behind the screens, checked directly against the shop's service | [07-backend-checks.md](test-cases/07-backend-checks.md) |

## 3. What we won't test (this time)

- **The admin area.** It needs a separate exploration first.
- **Signing in with Google.** It depends on an outside service.
- **Translations,** beyond noting that seven languages exist. All checks assume English.
- **Speed, security and visual appearance.** Each needs different tools and its own plan.
- **The older versions and the "with bugs" version of the site.** The "with bugs" version is a good later exercise for practising how we investigate failures.

## 4. How we will test

- **Browser tests** follow each case's steps the way a customer would, and check what appears on screen.
- **Backend checks** talk to the shop's service directly. They're used to prepare data quickly (signing in, emptying the cart) and to confirm business rules the website hides.
- **The site loads its pages in stages,** so every step waits for the thing it needs to see, never for a fixed amount of time.
- **What gets automated first:** the High-priority cases (section 10), then Medium, then Low.

## 5. Test data and accounts

- The site publishes four demo accounts: one admin and three customers. Their details are kept in the project's environment settings, never written into tests or these documents.
- **Each customer has their own cart, saved by the shop.** Two tests using the same customer at the same time will interfere with each other, so each parallel test run uses a different customer, or registers a brand-new one.
- **The cart is emptied before every cart and checkout test.**
- **Registration tests use a new email address every time.**
- **Products are found by name,** never by the code in their web address, because the demo's data can be reset.
- **Check relationships, not exact values,** where possible. For example "prices go from lowest to highest" rather than specific prices, since the demo's data can change.
- **The shop checks that the state belongs to the chosen country.** Austria with "Vienna" was refused. Find a combination it accepts before automating order placement.

## 6. When testing starts and when it's done

**Ready to start when:**
- this plan has been reviewed;
- the site's web address and demo accounts are in the project's environment settings;
- the questions in section 9 are answered, or the team agrees to proceed without the answers.

**Done when:**
- every High-priority case is automated and passes three times in a row;
- Medium-priority cases are automated, or deliberately postponed with a reason;
- every failure caused by the site itself is written up in `docs/TEST_FIXES_KNOWLEDGE_BASE.md`;
- the site map records the date of the last successful run.

## 7. Risks and how we handle them

| Risk | Effect | What we do about it |
|---|---|---|
| Other people use the same demo, and its data changes or gets reset | Tests that expect exact names, prices or addresses break | Check relationships and rules, not fixed values. Create our own data |
| Each customer's cart is saved by the shop | Tests running together interfere | One customer per parallel run, or a fresh account. Empty the cart first |
| Some errors aren't shown on screen (orders refused at the last step) | A test could hang, or wrongly pass, at **Confirm** | Check the visible outcome *and* the shop's reply. Keep checkout tests short |
| Which country and state pairs are accepted is unclear | Orders are refused unexpectedly | Find a valid pair through a backend check before automating orders |
| Some pages are slow to load (the address step has about 250 countries) | Steps time out | Wait for the specific field or button, not the whole page |

## 8. Test case summary

| Area | Cases | High | Medium | Low | Seen during exploration | Needs confirming |
|---|---|---|---|---|---|---|
| Browsing and search | 10 | 2 | 4 | 4 | 4 | 6 |
| Product details | 5 | 2 | 0 | 3 | 2 | 3 |
| Shopping cart | 4 | 1 | 2 | 1 | 1 | 3 |
| Checkout and payment | 12 | 4 | 5 | 3 | 7 | 5 |
| Login and account | 8 | 1 | 5 | 2 | 3 | 5 |
| Contact form | 3 | 0 | 2 | 1 | 1 | 2 |
| Backend checks | 5 | 1 | 3 | 1 | 4 | 1 |
| **Total** | **47** | **11** | **21** | **15** | **22** | **25** |

"Seen during exploration" means the expected result was observed on the live site. "Needs confirming" means it's a reasonable expectation that hasn't been observed yet; confirm it on the first run.

## 9. Questions and suspected defects

1. **Suspected defect: refused orders show no message** (TC-CHK-11).
   - **Should happen:** if the shop refuses an order because the state doesn't belong to the country, the customer sees why and can fix it.
   - **What was seen:** the shop refused the order with a clear reason, but nothing appeared on screen, and **Confirm** simply did nothing.
2. **Suspected defect: an expired sign-in shows no message** (TC-CHK-12).
   - **Should happen:** the customer is told their session expired and is asked to sign in again.
   - **What was seen:** the order was refused, with nothing on screen.
3. **Question: which country and state combinations does the shop accept?** The postcode lookup fills in made-up addresses (for example a US state for an Austrian postcode). We need one working combination before automating TC-CHK-07.
4. **Question: what does the order confirmation look like?** It wasn't reached during exploration. Confirm it on the first run of TC-CHK-07.
5. **Accessibility finding:** the button that removes an item from the cart has no text or label, so screen-reader users can't tell what it does (TC-CRT-03).

Questions 1 and 2 may be deliberate training defects, since this is a practice site. Either way, our tests expect the correct behaviour and will report the difference.

## 10. Suggested order for automation

1. **Preparation:** add the site and accounts to the environment settings, and create a way to sign in and empty the cart through the shop's service.
2. **High priority (smoke):** TC-CAT-01, TC-CAT-02, TC-PRD-01, TC-PRD-03, TC-CRT-01, TC-AUT-01, TC-CHK-01, TC-CHK-03, TC-CHK-06, TC-API-01. Add TC-CHK-07 once questions 3 and 4 are answered.
3. **Medium priority,** area by area, in the order of section 2.
4. **Low priority.**
