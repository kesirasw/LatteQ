# Orders and invoices — Toolshop API

Part of the [Toolshop API test plan](../test-plan.md).

**What this covers:** Placing an order (which creates an invoice) as a signed-in customer or as a guest, reading, listing and searching one's own invoices, the invoice PDF, and making sure customers can't see or change other people's orders or do admin-only changes. Two related checks are already in the UI plan's backend checks and aren't repeated here: **TC-API-04** (a state that doesn't belong to the country is refused) and **TC-API-05** (placing an order without a valid access key is refused).

| Operation | Endpoint | Auth |
|---|---|---|
| Place an order | `POST /invoices` | Yes |
| Place a guest order | `POST /invoices/guest` | No |
| List my invoices | `GET /invoices` | Yes |
| Read an invoice | `GET /invoices/{invoiceId}` | Yes |
| Replace an invoice | `PUT /invoices/{invoiceId}` | Yes |
| Change some of an invoice | `PATCH /invoices/{invoiceId}` | Yes |
| Change an invoice's status | `PUT /invoices/{invoiceId}/status` | Yes |
| Search my invoices | `GET /invoices/search` | Yes |
| PDF status | `GET /invoices/{invoice_number}/download-pdf-status` | Yes |
| Download the PDF | `GET /invoices/{invoice_number}/download-pdf` | Yes |

All "place an order" cases use the address the shop's postcode lookup gives for Austria, postcode 1010, house 1 (street Marvin-Krenn-Gasse, city Mittersill, state Vorarlberg, country code AT), because the shop refuses any other address (site map, "Address validation").

| ID | Title | Priority | Basis |
|---|---|---|---|
| API-INV-01 | Placing an order | High | Documented in contract |
| API-INV-02 | A new order appears in my invoice list | High | Documented in contract |
| API-INV-03 | Reading my invoice with its lines and payment | High | Documented in contract |
| API-INV-04 | Another customer can't see my order | High | Seen in live response |
| API-INV-05 | Reading an invoice that doesn't exist | Medium | Documented in contract |
| API-INV-06 | Reading an invoice with a badly formed ID | Low | Seen in live response |
| API-INV-07 | Placing an order with an empty request is refused | Medium | Documented in contract |
| API-INV-08 | Placing an order without each required detail is refused | Medium | Documented in contract |
| API-INV-09 | Placing an order with the wrong kind of value is refused | Medium | Seen in live response |
| API-INV-10 | Placing an order with a payment method that isn't offered is refused | Medium | Documented in contract |
| API-INV-11 | Payment details that don't fit the payment method are refused | High | Documented in contract |
| API-INV-12 | Placing an order for a cart that doesn't exist | Medium | Documented in contract |
| API-INV-13 | The same cart can't be ordered twice | High | Needs confirming |
| API-INV-14 | Invoice operations refuse requests without a valid access key | High | Documented in contract |
| API-INV-15 | A customer can't change an invoice | High | Needs confirming |
| API-INV-16 | A customer can't change an invoice's status | High | Needs confirming |
| API-INV-17 | Searching my invoices by invoice number | Medium | Documented in contract |
| API-INV-18 | Searching invoices without a search phrase is refused | Low | Documented in contract |
| API-INV-19 | Asking for the PDF status of a new invoice | Medium | Documented in contract |
| API-INV-20 | Downloading a PDF that hasn't been made yet | Low | Seen in live response |
| API-INV-21 | Asking for the PDF status of an invoice that doesn't exist | Low | Documented in contract |
| API-INV-22 | Placing a guest order | Medium | Documented in contract |
| API-INV-23 | A guest order without the guest's details is refused | Medium | Seen in live response |
| API-INV-24 | Unsupported methods on invoice addresses are refused | Low | Documented in contract |

---

### API-INV-01 — Placing an order

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in. Create a cart with 2 of the first product in the list.
- **Request:** Place an order for that cart with the accepted Austrian billing address and cash on delivery.
- **Expected response:** **200 OK** (the live service answers **201 Created**, which suits a new invoice better; see finding 11). The response has the documented invoice details: an invoice number starting with **INV-**, the billing address that was sent, the customer's ID, and a total equal to 2 × the product's price.
- **Basis:** Documented in contract (shape); totals and the 201 seen in live response
- **Changes data:** Yes — creates an invoice for a throwaway customer. Clean up: not possible (invoices can't be deleted); the customer is a throwaway account.
- **Contract reference:** `POST /invoices`: documented responses 200 (InvoiceResponse), 401, 404, 405, 422

### API-INV-02 — A new order appears in my invoice list

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /invoices`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** Ask for the customer's invoice list.
- **Expected response:** **200 OK** with a page of invoices in the documented shape. It contains exactly one invoice, with the same invoice number and total as the order.
- **Basis:** Documented in contract
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `GET /invoices`: documented responses 200 (paginated InvoiceResponse), 401, 404, 405

### API-INV-03 — Reading my invoice with its lines and payment

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /invoices/{invoiceId}`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** Ask for that invoice by its ID.
- **Expected response:** **200 OK** with the documented invoice details. It has one invoice line: the ordered product, quantity 2, at the product's price. The status is **AWAITING_FULFILLMENT** and the payment method is cash on delivery.
- **Basis:** Documented in contract (lines); status and payment seen in live response
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `GET /invoices/{invoiceId}`: documented responses 200 (InvoiceResponse), 401, 404, 405

### API-INV-04 — Another customer can't see my order

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `GET /invoices/{invoiceId}`, `GET /invoices`, `GET /invoices/search`
- **Before you start:** Place an order as one customer. Register a second customer and log in as them.
- **Request:** As the second customer, try to find the first customer's invoice.
- **Variations:**

  | Request | Expected |
  |---|---|
  | read it by its ID | **404 Not Found** |
  | list my invoices | **200 OK**, empty list |
  | search for its invoice number | **200 OK**, no results |

- **Expected response:** As listed. None of the first customer's invoice details are returned.
- **Basis:** Seen in live response (404 is documented; the contract doesn't say invoices are private)
- **Changes data:** Yes — as API-INV-01, plus a second throwaway customer.
- **Contract reference:** `GET /invoices/{invoiceId}`: 404

### API-INV-05 — Reading an invoice that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `GET /invoices/{invoiceId}`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for a well-formed invoice ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the requested item wasn't found.
- **Basis:** Documented in contract (404 ItemNotFoundResponse)
- **Changes data:** No
- **Contract reference:** `GET /invoices/{invoiceId}`: 404

### API-INV-06 — Reading an invoice with a badly formed ID

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /invoices/{invoiceId}`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for an invoice with an ID that isn't a real ID.
- **Variations:**

  | Invoice ID |
  |---|
  | text ("abc") |
  | a number ("123") |
  | a database injection attempt |
  | a script tag |

- **Expected response:** **404 Not Found** for each, with no server error.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /invoices/{invoiceId}`: 404

### API-INV-07 — Placing an order with an empty request is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in.
- **Request:** Place an order with no details at all.
- **Expected response:** **422 Unprocessable Entity**, listing the missing details (address, payment method, payment details, cart). No invoice is created.
- **Basis:** Documented in contract (422); messages seen in live response
- **Changes data:** No
- **Contract reference:** `InvoiceRequest`: required billing_street, billing_city, billing_state, billing_country, billing_postal_code, payment_method, payment_details, cart_id

### API-INV-08 — Placing an order without each required detail is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in. Create a cart with a product.
- **Request:** Place a valid order, leaving out one required detail at a time.
- **Variations:**

  | Left out |
  |---|
  | street (billing_street) |
  | city (billing_city) |
  | state (billing_state) |
  | country (billing_country) |
  | postal code (billing_postal_code) |
  | payment method (payment_method) |
  | payment details (payment_details) |
  | cart (cart_id) |

- **Expected response:** **422 Unprocessable Entity** for each, naming the missing detail. No invoice is created.
- **Basis:** Documented in contract (all eight are required)
- **Changes data:** No (if refused). Creates a cart; clean up by deleting it.
- **Contract reference:** `InvoiceRequest`: required details
- **Notes:** Live, the service refuses six of them, but **accepts an order without a state or without a postal code** and creates the invoice (**201 Created**). See finding 15.

### API-INV-09 — Placing an order with the wrong kind of value is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in. Create a cart with a product.
- **Request:** Place a valid order where one address detail is a number instead of text.
- **Variations:**

  | Detail sent as a number |
  |---|
  | street |
  | city |
  | state |
  | country |
  | postal code |

- **Expected response:** **422 Unprocessable Entity** for each, saying that detail must be text. No invoice is created.
- **Basis:** Seen in live response
- **Changes data:** No (if refused). Creates a cart; clean up by deleting it.
- **Contract reference:** `InvoiceRequest`: address details are text

### API-INV-10 — Placing an order with a payment method that isn't offered is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in. Create a cart with a product.
- **Request:** Place a valid order with a payment method that isn't one of the five offered.
- **Variations:**

  | Payment method |
  |---|
  | "bitcoin" |
  | a number |

- **Expected response:** **422 Unprocessable Entity** for each, saying the payment method is invalid.
- **Basis:** Documented in contract (five listed values); message seen in live response
- **Changes data:** No (if refused). Creates a cart; clean up by deleting it.
- **Contract reference:** `InvoiceRequest.payment_method`

### API-INV-11 — Payment details that don't fit the payment method are refused

- **Priority:** High
- **Type:** Validation
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in. Create a cart with a product.
- **Request:** Place a valid order where the payment details don't fit.
- **Variations:**

  | Payment method | Payment details |
  |---|---|
  | credit card | none |
  | cash on delivery | a piece of text |

- **Expected response:** **422 Unprocessable Entity** for each, naming the payment details. Never a server error.
- **Basis:** Documented in contract (payment details must be one of the documented sets of details)
- **Changes data:** No (if refused). Creates a cart; clean up by deleting it.
- **Contract reference:** `InvoiceRequest.payment_details`
- **Notes:** The live service answers **500 Internal Server Error** for both. See finding 7.

### API-INV-12 — Placing an order for a cart that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `POST /invoices`
- **Before you start:** Register a customer and log in.
- **Request:** Place a valid order with a cart that doesn't exist.
- **Variations:**

  | Cart |
  |---|
  | a well-formed cart ID that doesn't exist |
  | a number instead of an ID |

- **Expected response:** **404 Not Found** for each, saying the requested item wasn't found. No invoice is created.
- **Basis:** Documented in contract (404); seen in live response
- **Changes data:** No
- **Contract reference:** `POST /invoices`: 404

### API-INV-13 — The same cart can't be ordered twice

- **Priority:** High
- **Type:** Business rule
- **Endpoint:** `POST /invoices`
- **Before you start:** Place an order (as in API-INV-01) and keep its cart ID.
- **Request:** Place a second order with the same cart.
- **Expected response:** Refused (**422 Unprocessable Entity**, or **409 Conflict**), because that cart has already been ordered. The customer still has only one invoice.
- **Basis:** Needs confirming (the contract doesn't say what happens to a cart after ordering)
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `POST /invoices`
- **Notes:** The live service creates a second invoice for the same cart (**201 Created**), so a repeated request (for example, a double-click) charges the customer twice. See finding 4.

### API-INV-14 — Invoice operations refuse requests without a valid access key

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** all protected invoice operations except placing an order (covered by TC-API-05)
- **Before you start:** Place an order (to have a real invoice ID and number).
- **Request:** Call each operation once without an access key and once with an invalid one.
- **Variations:**

  | Operation |
  |---|
  | list invoices (`GET /invoices`) |
  | read an invoice (`GET /invoices/{invoiceId}`) |
  | replace an invoice (`PUT /invoices/{invoiceId}`) |
  | change some of an invoice (`PATCH /invoices/{invoiceId}`) |
  | change an invoice's status (`PUT /invoices/{invoiceId}/status`) |
  | search invoices (`GET /invoices/search`) |
  | PDF status (`GET /invoices/{invoice_number}/download-pdf-status`) |
  | download the PDF (`GET /invoices/{invoice_number}/download-pdf`) |

- **Expected response:** **401 Unauthorized** for every operation and both kinds of key, with an "Unauthorized" message and no invoice data.
- **Basis:** Documented in contract (401 UnauthorizedResponse on each)
- **Changes data:** Yes — as API-INV-01 (the set-up order). Nothing changes if refused.
- **Contract reference:** each operation's 401

### API-INV-15 — A customer can't change an invoice

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `PUT /invoices/{invoiceId}`, `PATCH /invoices/{invoiceId}`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** As the same customer, try to change the invoice.
- **Variations:**

  | Method | Sent |
  |---|---|
  | replace all details | the same valid details (a new address would be refused by the address check before the permission check) |
  | change some details | a different city only |

- **Expected response:** **403 Forbidden** for both. An issued invoice is a financial record; only the shop (admin) should change it. The invoice is unchanged.
- **Basis:** Needs confirming (the contract documents no 403 for these operations; see finding 3)
- **Changes data:** No (if refused). As API-INV-01 for set-up.
- **Contract reference:** `PUT /invoices/{invoiceId}`, `PATCH /invoices/{invoiceId}`: documented responses 200, 401, 404, 405, 422
- **Notes:** The live service answers **200 OK** and changes the invoice.

### API-INV-16 — A customer can't change an invoice's status

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `PUT /invoices/{invoiceId}/status`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** As the same customer, set the invoice status to **SHIPPED** with a short status message.
- **Expected response:** **403 Forbidden**. Only the shop should mark orders as shipped. The status stays **AWAITING_FULFILLMENT**.
- **Basis:** Needs confirming (the contract documents no 403; see finding 3)
- **Changes data:** No (if refused). As API-INV-01 for set-up.
- **Contract reference:** `PUT /invoices/{invoiceId}/status`: documented responses 200, 401, 404, 405, 422
- **Notes:** The live service answers **200 OK** and the customer's order becomes "shipped".

### API-INV-17 — Searching my invoices by invoice number

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /invoices/search`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** Search the customer's invoices for that invoice number.
- **Expected response:** **200 OK** with a page of invoices in the documented shape, containing exactly that invoice.
- **Basis:** Documented in contract
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `GET /invoices/search`: documented responses 200, 401, 404, 405

### API-INV-18 — Searching invoices without a search phrase is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `GET /invoices/search`
- **Before you start:** Register a customer and log in.
- **Request:** Search invoices without giving a search phrase.
- **Expected response:** Refused as invalid (**422 Unprocessable Entity**), because the search phrase is required.
- **Basis:** Documented in contract (search phrase required)
- **Changes data:** No
- **Contract reference:** `GET /invoices/search`: q (required)
- **Notes:** The live service answers **200 OK** and returns all the customer's invoices. See finding 16.

### API-INV-19 — Asking for the PDF status of a new invoice

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /invoices/{invoice_number}/download-pdf-status`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** Ask for the PDF status of that invoice number.
- **Expected response:** **200 OK**, saying whether the PDF is ready.
- **Basis:** Documented in contract (200)
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `GET /invoices/{invoice_number}/download-pdf-status`: documented responses 200 (InvoiceResponse), 401, 404, 405
- **Notes:** The live service answers **400 Bad Request** with the status **NOT_INITIATED**. The contract also describes the answer as a whole invoice, which doesn't fit a status check. See finding 8.

### API-INV-20 — Downloading a PDF that hasn't been made yet

- **Priority:** Low
- **Type:** Not found
- **Endpoint:** `GET /invoices/{invoice_number}/download-pdf`
- **Before you start:** Place an order (as in API-INV-01).
- **Request:** Download the PDF for that invoice number straight away.
- **Expected response:** **404 Not Found**, saying the document hasn't been created yet.
- **Basis:** Seen in live response (404 is documented, but not for this reason)
- **Changes data:** Yes — as API-INV-01.
- **Contract reference:** `GET /invoices/{invoice_number}/download-pdf`: 404

### API-INV-21 — Asking for the PDF status of an invoice that doesn't exist

- **Priority:** Low
- **Type:** Not found
- **Endpoint:** `GET /invoices/{invoice_number}/download-pdf-status`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for the PDF status of an invoice number nobody has (INV-0000000000).
- **Expected response:** **404 Not Found**.
- **Basis:** Documented in contract (404)
- **Changes data:** No
- **Contract reference:** `GET /invoices/{invoice_number}/download-pdf-status`: 404
- **Notes:** The live service answers **400 Bad Request** with the status **NOT_INITIATED**, the same as for a real invoice. See finding 8.

### API-INV-22 — Placing a guest order

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `POST /invoices/guest`
- **Before you start:** Create a cart with 2 of the first product in the list. No account needed.
- **Request:** Place a guest order for that cart with the accepted Austrian billing address, cash on delivery, and the guest's email, first name and last name.
- **Expected response:** **200 OK** (the live service answers **201 Created**; see finding 11). The response has the documented invoice details: an invoice number starting with **INV-**, the billing address sent, no customer linked, and a total equal to 2 × the product's price.
- **Basis:** Documented in contract (shape); 201 and the empty customer link seen in live response
- **Changes data:** Yes — creates a guest invoice. Clean up: not possible (invoices can't be deleted); the guest email is a test address.
- **Contract reference:** `POST /invoices/guest`: documented responses 200 (InvoiceResponse), 422

### API-INV-23 — A guest order without the guest's details is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /invoices/guest`
- **Before you start:** Create a cart with a product.
- **Request:** Place a guest order with a problem in the details.
- **Variations:**

  | Problem | Named in the response |
  |---|---|
  | no details at all | payment method, address, guest details … |
  | no guest email address | guest email |
  | guest email **not-an-email** | guest email (not a valid address) |

- **Expected response:** **422 Unprocessable Entity** for each, naming the problem. No invoice is created.
- **Basis:** Seen in live response (422 is documented)
- **Changes data:** No (if refused). Creates a cart; clean up by deleting it.
- **Contract reference:** `POST /invoices/guest`: 422

### API-INV-24 — Unsupported methods on invoice addresses are refused

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `DELETE /invoices/{invoiceId}`, `DELETE /invoices`
- **Before you start:** Register a customer and log in.
- **Request:** Try to delete an invoice, and try to delete the invoice list.
- **Expected response:** **405 Method Not Allowed** for both, saying the method isn't allowed for this route.
- **Basis:** Documented in contract (405 MethodNotAllowedResponse)
- **Changes data:** No
- **Contract reference:** `/invoices`, `/invoices/{invoiceId}`: 405
