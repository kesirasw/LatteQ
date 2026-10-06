# Practice Software Testing (Toolshop) — UI map

| | |
|---|---|
| Base URL | `https://practicesoftwaretesting.com/` (Sprint 5, v5.0, "v2.5 Built 2026-09-30, Angular 20.0.5" in footer). `ENV.TOOLSHOP_URL` / `ENV.TOOLSHOP_API_URL` |
| API | `https://api.practicesoftwaretesting.com` · OpenAPI 3.2 contract (57 paths): `/docs?api-docs.json` · human view: `/api/documentation` · endpoint inventory: `api-context/toolshop/INVENTORY.md` |
| Other builds | `v1`–`v4.practicesoftwaretesting.com` (earlier sprints) · `with-bugs.practicesoftwaretesting.com` (deliberately buggy, for debugging practice) |
| Captured | 2026-10-04 · chrome-devtools-mcp 1.10.1 · headless Chrome (en) |
| Snapshots | `home` · `home.search-pliers` · `home.sort-price-asc` · `home.filter-hammer` · `product` · `product.added-to-cart` · `checkout.1-cart` (+`.verbose`) · `checkout.2-signin` · `checkout.2-guest` · `checkout.2-signed-in` · `checkout.3-address` · `checkout.4-payment.<method>` (5) · `checkout.5-payment-checked` · `login` · `account` · `register` · `forgot-password` · `contact` · `contact.empty-submit` · **2nd crawl:** `login.wrong-password` · `account.user-menu` · `account.invoices` (+verbose) · `checkout.1-cart.qty-3` (verbose) · `checkout.1-cart.empty` · `checkout.6-order-placed` · `contact.sent` · `forgot-password.submitted` · `register.weak-password` |
| Used by | `pages/Toolshop*.ts` · `tests/toolshop/*.spec.ts` · `tests/api/toolshop/*.spec.ts` · `test-plans/toolshop/` (47 cases reference the flow step IDs below) |
| Last verified by run | 2026-10-05 (Toolshop project 3/3, 141 of 141 as expected, no retries) |

## Demo accounts (published in the project README)

| Role | Email | Password |
|---|---|---|
| admin | admin@practicesoftwaretesting.com | welcome01 |
| customer (Jane Doe) | customer@practicesoftwaretesting.com | welcome01 |
| customer (Jack Howe) | customer2@practicesoftwaretesting.com | welcome01 |
| customer (Bob Smith) | customer3@practicesoftwaretesting.com | pass123 |

These are shared with everyone who practises on the site. Put them in `ENV` via `process.env`, as with any credential.

## Quirks
- **Angular SPA:** the URL loads before the content renders. Snapshots taken immediately after navigation were empty (checkout cart, login form). Always wait for a landmark element, never for load events alone.
- **`data-test` attributes everywhere** (101 on the home page: `product-name`, `product-price`, `add-to-cart`, `cart-quantity`, `cart-total`, `proceed-1`, `proceed-3`, `finish`, …). Playwright's `getByTestId` reads `data-testid`, and the GitHub spec depends on that default. Use role locators first; where none exists, use `page.locator('[data-test="…"]')` with a comment. Don't change `testIdAttribute` globally.
- **Stock changes under you** (seen 2026-10-06): the demo is shared, so other people's orders sell products out. A sold-out product page shows "Out of stock" and disables Quantity, the +/− buttons and **Add to cart**; the API reports `in_stock: false`. Tests that buy pick a product that is in stock now (`toolshopInStockProduct` fixture, KB §16).
- **Cart is server-side per user** (`cart_id` in API calls). Items survived logout/login. Tests sharing an account will see each other's carts → one account per parallel worker (3 customers available), or register a fresh user per test.
- **Login tokens last 300 seconds** (`expires_in: 300` from `POST /users/login`). That explains the silent 401 below.
- **Session expiry fails silently:** after a long pause on the payment step, `POST /invoices` returned **401** and the UI showed **no error**. "Confirm" just did nothing.
- **Server-side address rule:** `POST /invoices` returned **422** `{"billing_country":["The billing_country does not match the entered address. The state does not belong to the selected country."]}` for Austria + State "Vienna". Again **no UI error**.
- **Postcode lookup overwrites the address:** entering Postal code + House number calls `GET /postcode-lookup`, which returned *generated* data (`street: "Leffler Fords"`, `city: "New Arianna"`, `state: "Missouri"` for an Austrian postcode) and replaced Street/City in the form. The State field is not filled by it.
- **Billing address pre-fills from the profile** (Country Austria, Street, City), but Postal code, House number and State are empty. Because the demo profile is shared, its contents change over time.
- **Add-to-cart confirmation is transient:** no toast was in the snapshot after the click. Assert on the cart count (`cart-quantity`) or catch the toast immediately.
- **Country select has ~248 options:** snapshots of the address step are slow (≈3 min via CLI).
- Floating widgets: "Open chat", "Show live shop activity", and the top-bar buttons "Testing Guide" / "🐛 Bug Hunting". Not seen blocking clicks during the crawl.
- Product URLs use IDs (`/product/01M42MHP…`). Navigate by product name, never by ID: IDs can change when the demo database resets.
- Seven UI languages (`lang-de`, `el`, `en`, `es`, `fr`, `nl`, `tr`), so copy assertions assume English.

## Address validation (solved)
- Orders are accepted only when the billing address **matches the site's own postcode lookup**. With the country stored as a **code** (`AT`, which is what the register and checkout selects send), the lookup returns a realistic address and fills **Street, City and State** (Austria 1010 / house 1 → Marvin-Krenn-Gasse, Mittersill, Vorarlberg) → order accepted (201).
- With the country as a **name** ("Austria", e.g. old demo profiles) the lookup returns generated data (Leffler Fords, New Arianna, Missouri) and doesn't fill State. Typing any other state (e.g. "Vienna") is rejected with 422 "The state does not belong to the selected country", silently.
- API probes: invoices with arbitrary real addresses → 422 "city does not belong…"; with the lookup's exact street/city/state → 201.

## States & flows
| Step | Action | Observed outcome |
|---|---|---|
| C1 | open home | 9 product cards; pagination "Page-1"…"Page-5", "Previous", "Next"; filters by category (16 checkboxes), brand (2), eco-friendly; sort combobox; price slider |
| C2 | Search "pliers" → Search | heading **"Searched for: pliers"**; only pliers products (Combination Pliers, Pliers, Long Nose Pliers, Slip Joint Pliers, …) |
| C3 | sort "Price (Low - High)" | cheapest first: Washers $3.55, Flat-Head Wood Screws $3.95, M4 Nuts $4.65, … |
| C4 | tick category "Hammer" | only hammers: Claw Hammer with Shock Reduction Grip, Hammer, Claw Hammer, Thor Hammer, Sledgehammer |
| P1 | click card "Combination Pliers" | h1 "Combination Pliers", unit price 14.15, Quantity 1 (min 1, max 99), Add to cart / Add to favourites / Compare, Related products |
| P2 | Quantity 2 → Add to cart | `cart-quantity` = 2; "cart" link appears in nav |
| K1 | open `/checkout` | stepper CART · SIGN IN · BILLING ADDRESS · PAYMENT; row "Combination Pliers", qty 2, $14.15, line $28.30, total $28.30; Continue Shopping / Proceed to checkout |
| K2 | Proceed (logged out) | tabs "Sign in" / "Continue as Guest". Login form: Email address *, Password *, Login. Guest form: Email, First name, Last name, Continue as Guest |
| K3 | log in as customer | "Hello Jane Doe, you are already logged in. You can proceed to checkout."; nav shows "Jane Doe" |
| K4 | Proceed → Billing Address | Country/Street/City pre-filled; **Proceed disabled** until Postal code, House number **and** State are filled (each one checked individually) |
| K5 | Proceed → Payment | Payment Method: Bank Transfer · Cash on Delivery · Credit Card · Buy Now Pay Later · Gift Card |
| K6 | choose method | Bank Transfer: Bank Name, Account Name, Account Number · Credit Card: Card Number (`0000-0000-0000-0000`), Expiration Date, CVV (3–4 digits), Card Holder Name · BNPL: Monthly Installments 3/6/9/12 · Gift Card: Number (16 chars), Validation Code (4 chars) · Cash on Delivery: no fields |
| K7 | Cash on Delivery → "Check payment" | `POST /payment/check` 200; text **"Payment was successful"**; the same button becomes **"Confirm"** |
| K8 | Confirm | `POST /invoices` → 401 (expired session) / 422 (state ≠ country) in the crawl, both with no UI feedback. **Success screen not yet observed** |
| A1 | `/auth/login`, submit with email missing | **"Email is required"** under the email field |
| A2 | log in | heading "My account"; links Favorites · Profile · Invoices · Messages |
| F1 | `/contact`, Send empty | "First name is required", "Last name is required", "Email is required", "Subject is required", "Message is required"; attachment rule "Only files with the txt extension are allowed, and files must be 0kb." |
| R1 | `/auth/register` | Customer registration: First name, Last name, Date of Birth *, Country, Postal code, House number, Street, City, State, Phone, Email address, Password; rules "at least 8 characters", "uppercase and lowercase", "at least one number", "at least one special symbol"; strength Weak/Moderate/Strong/Very Strong |
| A3 | wrong password | **"Invalid email or password"** |
| A4 | user menu (name button) | links My account, My favorites, My profile, My invoices, My messages; **"Sign out"** is an `<a>` without href (not in the a11y tree; `data-test="nav-sign-out"`) |
| A5 | Sign out | token (`localStorage["auth-token"]`) cleared, lands on `/auth/login`; `/account` while signed out → `/auth/login` |
| P3 | Add to favourites (signed out) | alert **"Unauthorized, can not add product to your favorite list."** |
| P4 | Add to cart | alert **"Product added to shopping cart."** (transient) |
| K9 | cart: set quantity 3 (+ Tab) | line and total $42.45 (3 × 14.15), badge 3 |
| K10 | cart: remove (red X) | alert **"Product deleted."**, text **"The cart is empty. Nothing to display."**, cart icon gone |
| K11 | guest tab, submit empty | "Email is required", "First name is required", "Last name is required" |
| K12 | guest continue | "Continuing as guest: <first> <last> (<email>)" |
| K13 | address: Country Austria, Postal 1010, House 1 | lookup fills Street/City/State → Proceed enabled |
| K14 | payment validation | Credit card "1234" → **"Invalid card number format."**; Gift card short → **"Please enter a valid gift card number: exactly 16 letters and/or digits."** + **"Please enter a valid validation code: exactly 4 letters and/or digits."**; BNPL without instalments → no message; **Check payment** stays disabled in all three |
| K15 | Confirm (valid address, fresh token) | **"Thanks for your order! Your invoice number is INV-…"**; `POST /invoices` 201; cart emptied; invoice listed in **Invoices** table (Invoice Number, Billing Address, Invoice Date, Total) |
| C5 | Page 2 | a different 9 products (Sledgehammer, …) |
| C6 | X after a search | full first page back |
| C7 | brand ForgeFlex Tools | list changes (hammers, saw, wrenches…) |
| C8 | eco-friendly filter | every card's active CO₂ letter is A/B (unfiltered page 2: D) |
| C9 | price slider max (PageDown ×n) | max drops 20 per press (100 → 80 …); 6 presses → 1 → no products |
| P5 | related product "Pliers" | Pliers product page |
| F3 | contact, attach a non-empty .txt, Send | **"File should be empty."** (`data-test="attachment-error"`), message not sent |
| F2 | contact, all fields + subject + 50+ char message | **"Thanks for your message! We will contact you shortly."** |
| R3 | register, valid data | redirect to `/auth/login`; new account can sign in |
| R4 | register, password "abc" | stays on register; **"Password must be minimal 6 characters long."** + **"Password can not include invalid characters."** (page rule says 8, inconsistent) |
| R2 | `/auth/forgot-password` | heading "Forgot Password"; Email address *; "Set New Password". After submit: shows the raw text **`page.forgot-password.confirm`** (missing translation) |

## Locators
| Key | Playwright locator | Source | Notes |
|---|---|---|---|
| **Header** | | | |
| navHome | `page.getByRole('link', { name: 'Home' })` | cdt | |
| categoriesMenu | `page.getByRole('button', { name: /^Categories/ })` | cdt | Name has a trailing space |
| navContact | `page.getByRole('link', { name: 'Contact' })` | cdt | |
| navSignIn | `page.getByRole('link', { name: 'Sign in' })` | cdt | Logged out only |
| userMenu(name) | `page.getByRole('button', { name: new RegExp('^' + name) })` | cdt | e.g. "Jane Doe ". Logged in only |
| cartLink | `page.getByRole('link', { name: 'cart' })` | cdt | Only rendered when the cart is non-empty |
| cartQuantity | `page.locator('[data-test="cart-quantity"]')` | evaluate_script | No accessible name |
| languageSelect | `page.getByRole('button', { name: 'Select language' })` | cdt | |
| **Catalogue** | | | |
| sort | `page.getByRole('combobox', { name: 'sort' })` | cdt | Native select: `selectOption({ label: 'Price (Low - High)' })` |
| searchBox / searchSubmit / searchReset | `getByRole('textbox', { name: 'Search' })` / `getByRole('button', { name: 'Search' })` / `getByRole('button', { name: 'X', exact: true })` | cdt | The Search heading is `heading " Search"`, a different role |
| searchHeading | `page.getByRole('heading', { name: /^Searched for:/ })` | cdt | |
| categoryFilter(name) | `page.getByRole('checkbox', { name: '<name>', exact: true })` | cdt | `exact` needed ("Saw" vs "Hand Saw") |
| brandFilter(name) | `page.getByRole('checkbox', { name: '<brand>' })` | cdt | ForgeFlex Tools, MightyCraft Hardware |
| ecoFilter | `page.getByRole('checkbox', { name: 'Show only eco-friendly products' })` | cdt | |
| priceSlider | `page.getByRole('slider', { name: 'ngx-slider', exact: true })` / `{ name: 'ngx-slider-max' }` | cdt | |
| productCards | `page.getByRole('link').filter({ has: page.getByRole('heading', { level: 5 }) })` | cdt | Each card is a link with an h5 name |
| productCard(name) | `page.getByRole('link').filter({ has: page.getByRole('heading', { level: 5, name: '<name>', exact: true }) })` | cdt | |
| productNames / productPrices | `page.locator('[data-test="product-name"]')` / `'[data-test="product-price"]'` | evaluate_script | For reading lists (sort/filter assertions) |
| page(n) / next / previous | `getByRole('button', { name: 'Page-<n>' })` / `{ name: 'Next' }` / `{ name: 'Previous' }` | cdt | |
| **Product** | | | |
| productTitle | `page.getByRole('heading', { level: 1 })` | cdt | |
| unitPrice | `page.locator('[data-test="unit-price"]')` | evaluate_script | "14.15" (no $) |
| quantity | `page.getByRole('spinbutton', { name: 'Quantity' })` | cdt | min 1, max 99 |
| increaseQty / decreaseQty | `getByRole('button', { name: 'Increase quantity' })` / `'Decrease quantity'` | cdt | |
| addToCart | `page.getByRole('button', { name: 'Add to cart' })` | cdt | |
| addToFavourites | `page.getByRole('button', { name: /Add to favourites/ })` | cdt | Leading icon space |
| relatedProducts | `page.getByRole('heading', { name: 'Related products' })` | cdt | |
| **Checkout** | | | |
| cartRow(name) | `page.getByRole('row').filter({ hasText: '<name>' })` | cdt (verbose) | Columns: Item, Quantity, Price, Total, (remove) |
| cartRowQty(name) | `page.getByRole('spinbutton', { name: 'Quantity for <name>' })` | cdt | |
| linePrice / cartTotal | `page.locator('[data-test="line-price"]')` / `'[data-test="cart-total"]'` | evaluate_script | |
| removeItem(name) | `cartRow(name).locator('.btn-danger')` | evaluate_script + run | `<a class="btn btn-danger">` with an X icon: no href, no label, not in the a11y tree → scoped CSS is the only option |
| signOut | `page.getByText('Sign out', { exact: true })` | evaluate_script | Not a link in the a11y tree |
| alert | `page.getByRole('alert')` | evaluate_script | Transient toasts (cart, favourites, delete) |
| co2Active(card) | `card.locator('[data-test="co2-rating-badge"] .co2-letter.active')` | evaluate_script | Active CO₂ letter A–E |
| invoicesTable | `page.getByRole('table')` with `getByRole('cell', { name: 'INV-…' })` | cdt (verbose) | |
| continueShopping / proceed | `getByRole('button', { name: 'Continue Shopping' })` / `{ name: 'Proceed to checkout' }` | cdt | Same name on steps 1–3; scope by step, or use `data-test` `proceed-1/2/3` |
| signInTab / guestTab | `page.getByRole('tab', { name: 'Sign in' })` / `{ name: 'Continue as Guest' }` | cdt | |
| loginEmail / loginPassword / loginSubmit | `getByRole('textbox', { name: 'Email address *' })` / `'Password *'` / `getByRole('button', { name: 'Login' })` | cdt | Same on `/auth/login` |
| alreadyLoggedIn | `page.getByText(/you are already logged in/)` | cdt | |
| guestEmail / guestFirst / guestLast / guestSubmit | `getByRole('textbox', { name: 'Email address *' })` / `'First name *'` / `'Last name *'` / `getByRole('button', { name: 'Continue as Guest' })` | cdt | |
| country | `page.getByRole('combobox', { name: 'Country' })` | cdt | Native select, labels like "United States of America (the)" |
| postalCode / houseNumber / street / city / state | `getByRole('textbox', { name: 'Postal code' })` … `{ name: 'State' }` | cdt | |
| paymentMethod | `page.getByRole('combobox', { name: 'Payment Method' })` | cdt | |
| bankName / accountName / accountNumber | `getByRole('textbox', { name: 'Bank Name' })` … | cdt | |
| cardNumber / expiry / cvv / cardHolder | `getByRole('textbox', { name: 'Credit Card Number' })` / `'Expiration Date'` / `'CVV'` / `'Card Holder Name'` | cdt | |
| installments | `page.getByRole('combobox', { name: 'Monthly Installments' })` | cdt | 3/6/9/12 |
| giftCardNumber / giftCardCode | `getByRole('textbox', { name: 'Gift Card Number' })` / `'Validation Code'` | cdt | |
| checkPayment → confirm | `getByRole('button', { name: 'Check payment' })` → `{ name: 'Confirm' }` | cdt | Same element (`data-test="finish"`) renamed after the check |
| paymentSuccess | `page.getByText('Payment was successful')` | cdt | |
| **Auth & account** | | | |
| googleSignIn | `page.getByRole('button', { name: 'Sign in with Google' })` | cdt | Out of scope |
| emailRequired | `page.getByText('Email is required')` | cdt | |
| accountHeading | `page.getByRole('heading', { name: 'My account', level: 1 })` | cdt | |
| accountLink(name) | `page.getByRole('link', { name: new RegExp(name + '$') })` | cdt | " Favorites", " Profile", " Invoices", " Messages" |
| registerFields | `getByRole('textbox', { name: 'First name' })` … `'Date of Birth *'` … `'Password'`; `getByRole('combobox', { name: 'Country' })` | cdt | |
| registerSubmit | `page.getByRole('button', { name: 'Register' })` | cdt | |
| forgotEmail / setNewPassword | `getByRole('textbox', { name: 'Email address *' })` / `getByRole('button', { name: 'Set New Password' })` | cdt | |
| **Contact** | | | |
| contactFields | `getByRole('textbox', { name: 'First name' })` / `'Last name'` / `'Email address'` / `'Message *'` | cdt | |
| subject | `page.getByRole('combobox', { name: 'Subject' })` | cdt | Customer service, Webmaster, Return, Payments, Warranty, Status of my order |
| attachment | `page.getByRole('button', { name: 'Attachment' })` | cdt | File input. Only .txt, 0 kb |
| send | `page.getByRole('button', { name: 'Send' })` | cdt | |
| requiredMessage(field) | `page.getByText('<Field> is required')` | cdt | |

## API calls seen
| Call | When | Observed |
|---|---|---|
| `POST /users/login` | login | 200 |
| `GET /postcode-lookup?country=&postcode=&house_number=` | address step | 200, generated address |
| `POST /payment/check` | Check payment | 200 |
| `POST /invoices` | Confirm | 401 (expired session), 422 (state ≠ country) |

## Gaps
- Admin area not crawled. Profile edit, favourites list and messages not exercised.
- Toast text for "Add to favourites" while signed in not captured.
