# Checkout and payment — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** The four checkout steps after the cart: signing in or continuing as a guest, the billing address, choosing and checking a payment method, and placing the order.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-CHK-01 | Signing in during checkout | High | Seen during exploration |
| TC-CHK-02 | Guest checkout asks for contact details | Medium | Needs confirming |
| TC-CHK-03 | Checkout waits for the required address details | High | Seen during exploration |
| TC-CHK-04 | Postcode lookup fills in the street and city | Medium | Seen during exploration |
| TC-CHK-05 | Each payment method asks for its own details | Medium | Seen during exploration |
| TC-CHK-06 | Checking a cash-on-delivery payment | High | Seen during exploration |
| TC-CHK-07 | Placing an order | High | Needs confirming |
| TC-CHK-08 | Credit card number must be in the right format | Medium | Needs confirming |
| TC-CHK-09 | Gift card details are checked | Low | Needs confirming |
| TC-CHK-10 | Buy now, pay later needs a number of instalments | Low | Needs confirming |
| TC-CHK-11 | A state that doesn't match the country is explained | Medium | Seen during exploration (suspected defect) |
| TC-CHK-12 | An expired sign-in at the last step is explained | Low | Seen during exploration (suspected defect) |

---

### TC-CHK-01 — Signing in during checkout

- **Priority:** High
- **Type:** Functional
- **Before you start:** Not signed in. One product in the cart. Viewing the cart.
- **Steps:**
  1. Click **Proceed to checkout**.
  2. On the **Sign in** tab, enter a demo customer's email address and password.
  3. Click **Login**.
- **Expected result:** The page says **Hello Jane Doe, you are already logged in. You can proceed to checkout.**, and the top menu shows the customer's name.
- **Basis:** Seen during exploration
- **Map reference:** K2, K3
- **Notes:** The greeting uses whichever demo customer signed in. "Jane Doe" is the first demo customer.

### TC-CHK-02 — Guest checkout asks for contact details

- **Priority:** Medium
- **Type:** Validation
- **Before you start:** Not signed in. One product in the cart. On the sign-in step of checkout.
- **Steps:**
  1. Choose the **Continue as Guest** tab.
  2. Leave **Email address**, **First name** and **Last name** empty.
  3. Click **Continue as Guest**.
- **Expected result:** Checkout doesn't continue, and each empty field is flagged as required.
- **Basis:** Needs confirming
- **Map reference:** K2
- **Notes:** The three fields and the button were seen. What happens on an empty submit wasn't tried.

### TC-CHK-03 — Checkout waits for the required address details

- **Priority:** High
- **Type:** Validation
- **Before you start:** Signed in as a demo customer, one product in the cart, on the **Billing Address** step.
- **Steps:**
  1. Leave **Postal code**, **House number** and **State** empty.
  2. Fill them in one at a time.
- **Expected result:** **Proceed to checkout** stays unavailable until all three are filled in, then becomes available.
- **Basis:** Seen during exploration
- **Map reference:** K4
- **Notes:** Country, Street and City are pre-filled from the customer's profile.

### TC-CHK-04 — Postcode lookup fills in the street and city

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** On the **Billing Address** step.
- **Steps:**
  1. Type a **Postal code**.
  2. Type a **House number**.
- **Expected result:** The **Street** and **City** fields are filled in automatically from the postcode.
- **Basis:** Seen during exploration
- **Map reference:** K4 (quirks: postcode lookup)
- **Notes:** The demo fills in made-up addresses, so check that the fields change, not what they change to.

### TC-CHK-05 — Each payment method asks for its own details

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** On the **Payment** step.
- **Steps:**
  1. Choose each option in **Payment Method** in turn.
- **Expected result:**
  - **Bank Transfer** asks for Bank Name, Account Name and Account Number.
  - **Credit Card** asks for Credit Card Number, Expiration Date, CVV and Card Holder Name.
  - **Buy Now Pay Later** asks you to choose 3, 6, 9 or 12 monthly instalments.
  - **Gift Card** asks for Gift Card Number and Validation Code.
  - **Cash on Delivery** asks for nothing more.
- **Basis:** Seen during exploration
- **Map reference:** K5, K6

### TC-CHK-06 — Checking a cash-on-delivery payment

- **Priority:** High
- **Type:** Functional
- **Before you start:** Signed in, address completed, on the **Payment** step.
- **Steps:**
  1. Choose **Cash on Delivery**.
  2. Click **Check payment**.
- **Expected result:** The message **Payment was successful** appears, and the button changes to **Confirm**.
- **Basis:** Seen during exploration
- **Map reference:** K7

### TC-CHK-07 — Placing an order

- **Priority:** High
- **Type:** Functional
- **Before you start:** Freshly signed in (not idle for long), with a country and state the shop accepts. The payment has been checked (TC-CHK-06).
- **Steps:**
  1. Click **Confirm**.
- **Expected result:** An order confirmation with an invoice number is shown. The cart is empty, and the new invoice appears under **My account → Invoices**.
- **Basis:** Needs confirming
- **Map reference:** K8
- **Notes:** The confirmation screen wasn't reached during exploration (see TC-CHK-11 and TC-CHK-12). First, find out which country and state combinations the shop accepts (plan, question 2).

### TC-CHK-08 — Credit card number must be in the right format

- **Priority:** Medium
- **Type:** Validation
- **Before you start:** On the **Payment** step with **Credit Card** chosen.
- **Steps:**
  1. Enter **1234** as the credit card number, and fill in the other card fields.
  2. Click **Check payment**.
- **Expected result:** An error explains that the number must be 16 digits in the format 0000-0000-0000-0000, and the payment isn't accepted.
- **Basis:** Needs confirming
- **Map reference:** K6
- **Notes:** The format rule is shown on the page. The error message itself wasn't seen.

### TC-CHK-09 — Gift card details are checked

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On the **Payment** step with **Gift Card** chosen.
- **Steps:**
  1. Enter a gift card number shorter than 16 characters and a 3-character validation code.
  2. Click **Check payment**.
- **Expected result:** An error explains what is wrong, and the payment isn't accepted.
- **Basis:** Needs confirming
- **Map reference:** K6

### TC-CHK-10 — Buy now, pay later needs a number of instalments

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On the **Payment** step with **Buy Now Pay Later** chosen.
- **Steps:**
  1. Don't choose a number of instalments.
  2. Click **Check payment**.
- **Expected result:** You're asked to choose a number of instalments, and the payment isn't accepted.
- **Basis:** Needs confirming
- **Map reference:** K6

### TC-CHK-11 — A state that doesn't match the country is explained

- **Priority:** Medium
- **Type:** Negative
- **Before you start:** Signed in, with one product in the cart.
- **Steps:**
  1. On the **Billing Address** step, use country **Austria** and state **Vienna**, and complete the other fields.
  2. On the **Payment** step, choose **Cash on Delivery** and click **Check payment**.
  3. Click **Confirm**.
- **Expected result:** A message explains that the address is invalid because the state doesn't belong to the chosen country, so the customer can correct it.
- **Basis:** Seen during exploration (suspected defect)
- **Map reference:** K8
- **Notes:** During exploration the shop refused the order for exactly this reason, but **nothing was shown on screen**: Confirm just did nothing.

### TC-CHK-12 — An expired sign-in at the last step is explained

- **Priority:** Low
- **Type:** Negative
- **Before you start:** Signed in, at the **Payment** step with the payment checked, then left idle for a long time (more than 10 minutes during exploration).
- **Steps:**
  1. Click **Confirm**.
- **Expected result:** The site says the session has expired and asks the customer to sign in again.
- **Basis:** Seen during exploration (suspected defect)
- **Map reference:** K8
- **Notes:** During exploration the shop refused the order because the sign-in had expired, but **nothing was shown on screen**.
