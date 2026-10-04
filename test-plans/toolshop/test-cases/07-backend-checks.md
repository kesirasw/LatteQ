# Backend checks — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** Checks made directly against the shop's service, without the website. They confirm the business rules behind the screens, and they're fast to run. The technical details (addresses, request formats) are in the site map.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-API-01 | Signing in through the service | High | Seen during exploration |
| TC-API-02 | Listing products through the service | Medium | Needs confirming |
| TC-API-03 | Checking a payment through the service | Medium | Seen during exploration |
| TC-API-04 | The service refuses a state that doesn't match the country | Medium | Seen during exploration |
| TC-API-05 | The service refuses orders without a valid sign-in | Low | Seen during exploration |

---

### TC-API-01 — Signing in through the service

- **Priority:** High
- **Type:** Backend
- **Before you start:** Have a demo customer's email address and password.
- **Steps:**
  1. Ask the service to sign in with those details.
- **Expected result:** The service accepts the sign-in and returns an access key, which can then be used for the other checks.
- **Basis:** Seen during exploration
- **Map reference:** API calls: sign in

### TC-API-02 — Listing products through the service

- **Priority:** Medium
- **Type:** Backend
- **Before you start:** Nothing.
- **Steps:**
  1. Ask the service for the list of products.
- **Expected result:** The service returns a page of products, and their names match the first page of the website's catalogue.
- **Basis:** Needs confirming
- **Map reference:** C1
- **Notes:** The service was confirmed to be up. The list wasn't compared with the website.

### TC-API-03 — Checking a payment through the service

- **Priority:** Medium
- **Type:** Backend
- **Before you start:** Signed in through the service (TC-API-01).
- **Steps:**
  1. Ask the service to check a cash-on-delivery payment.
- **Expected result:** The service accepts the payment check.
- **Basis:** Seen during exploration
- **Map reference:** K7

### TC-API-04 — The service refuses a state that doesn't match the country

- **Priority:** Medium
- **Type:** Backend
- **Before you start:** Signed in through the service, with a product in the cart.
- **Steps:**
  1. Ask the service to create an order with country **Austria** and state **Vienna**.
- **Expected result:** The service refuses the order and explains that the state doesn't belong to the selected country.
- **Basis:** Seen during exploration
- **Map reference:** K8
- **Notes:** This is the rule behind TC-CHK-11. The service explains the problem correctly, but the website doesn't pass the explanation on.

### TC-API-05 — The service refuses orders without a valid sign-in

- **Priority:** Low
- **Type:** Backend
- **Before you start:** Have a product in a cart, but no valid sign-in (none, or an expired one).
- **Steps:**
  1. Ask the service to create an order.
- **Expected result:** The service refuses the order because the request isn't signed in.
- **Basis:** Seen during exploration
- **Map reference:** K8
- **Notes:** Seen with an expired sign-in. Trying with no sign-in at all is part of this check.
