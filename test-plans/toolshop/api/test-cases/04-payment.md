# Payment check — Toolshop API

Part of the [Toolshop API test plan](../test-plan.md).

**What this covers:** The payment check the checkout runs before an order is placed: each of the five payment methods with valid details, the validation of each method's details, and requests that should be refused. TC-API-03 in the UI plan's backend checks covers cash on delivery for a signed-in customer; this file covers the rest.

| Operation | Endpoint | Auth |
|---|---|---|
| Check a payment | `POST /payment/check` | No |

| ID | Title | Priority | Basis |
|---|---|---|---|
| API-PAY-01 | Each payment method with valid details is accepted | High | Documented in contract |
| API-PAY-02 | A credit card without its details is refused | Medium | Seen in live response |
| API-PAY-03 | A badly formed credit card number is refused | Medium | Seen in live response |
| API-PAY-04 | An expired credit card is refused | Medium | Seen in live response |
| API-PAY-05 | A badly formed gift card is refused | Medium | Seen in live response |
| API-PAY-06 | A bank transfer without its details is refused | Low | Seen in live response |
| API-PAY-07 | Buy now, pay later without instalments is refused | Low | Seen in live response |
| API-PAY-08 | An empty payment check is refused | Medium | Needs confirming |
| API-PAY-09 | A payment method that isn't offered is refused | Medium | Documented in contract |
| API-PAY-10 | Payment details that aren't a set of details are refused | Low | Needs confirming |

---

### API-PAY-01 — Each payment method with valid details is accepted

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a payment for each method, with valid details for that method.
- **Variations:**

  | Payment method | Details sent |
  |---|---|
  | cash on delivery | none |
  | bank transfer | bank name, account name, account number |
  | credit card | card number (four groups of four digits), expiry date in the future, 3-digit security code, card holder name |
  | buy now, pay later | 3 monthly instalments |
  | gift card | 16-character gift card number, 4-character validation code |

- **Expected response:** **200 OK** for each, with the message **Payment was successful**.
- **Basis:** Documented in contract (200 PaymentResponse); the message and the detail formats seen in live response
- **Changes data:** No
- **Contract reference:** `POST /payment/check`: documented responses 200

### API-PAY-02 — A credit card without its details is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a credit card payment with no card details.
- **Expected response:** **422 Unprocessable Entity**, naming all four missing card details: number, expiry date, security code and card holder name.
- **Basis:** Seen in live response (the contract documents only 200; see finding 14)
- **Changes data:** No
- **Contract reference:** `CreditCardDetails`

### API-PAY-03 — A badly formed credit card number is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a credit card payment with valid details except a card number of **abc**.
- **Expected response:** **422 Unprocessable Entity**, saying the card number format is invalid.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `CreditCardDetails.credit_card_number`

### API-PAY-04 — An expired credit card is refused

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a credit card payment with valid details except an expiry date in the past (January 2020).
- **Expected response:** **422 Unprocessable Entity**, saying the expiry date must be after today.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `CreditCardDetails.expiration_date`

### API-PAY-05 — A badly formed gift card is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a gift card payment with a 3-character gift card number and a 1-character validation code.
- **Expected response:** **422 Unprocessable Entity**, saying both the gift card number and the validation code are badly formed.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GiftCardDetails`

### API-PAY-06 — A bank transfer without its details is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a bank transfer payment with no bank details.
- **Expected response:** **422 Unprocessable Entity**, naming the missing bank name, account name and account number.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `BankTransferDetails`

### API-PAY-07 — Buy now, pay later without instalments is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a buy now, pay later payment without the number of monthly instalments.
- **Expected response:** **422 Unprocessable Entity**, saying the monthly instalments are required.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `BuyNowPayLaterDetails`

### API-PAY-08 — An empty payment check is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a payment without any details: no method, no payment details.
- **Expected response:** **422 Unprocessable Entity**, saying the payment method is required.
- **Basis:** Needs confirming (the contract marks nothing as required, but a payment check without a method can't mean anything)
- **Changes data:** No
- **Contract reference:** `PaymentRequest`
- **Notes:** The live service answers **200 OK**, "Payment was successful". See finding 14.

### API-PAY-09 — A payment method that isn't offered is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a payment with a method that isn't one of the five offered.
- **Variations:**

  | Payment method |
  |---|
  | "bitcoin" |
  | a number |

- **Expected response:** **422 Unprocessable Entity** for each, saying the payment method is invalid.
- **Basis:** Documented in contract (the payment method is one of five listed values)
- **Changes data:** No
- **Contract reference:** `PaymentRequest.payment_method`
- **Notes:** The live service answers **200 OK**, "Payment was successful". See finding 14.

### API-PAY-10 — Payment details that aren't a set of details are refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /payment/check`
- **Before you start:** Nothing.
- **Request:** Check a cash-on-delivery payment where the payment details are a piece of text instead of a set of details.
- **Expected response:** **422 Unprocessable Entity**, saying the payment details are invalid.
- **Basis:** Needs confirming (the contract describes the payment details as a set of details)
- **Changes data:** No
- **Contract reference:** `PaymentRequest.payment_details`
- **Notes:** The live service answers **200 OK**. See finding 14.
