# Carts — Toolshop API

Part of the [Toolshop API test plan](../test-plan.md).

**What this covers:** Creating a cart, adding products, changing quantities, removing products and deleting the cart. Carts don't need an access key: anyone holding the cart ID can use it.

| Operation | Endpoint | Auth |
|---|---|---|
| Create a cart | `POST /carts` | No |
| Add a product | `POST /carts/{id}` | No |
| Read a cart | `GET /carts/{cartId}` | No |
| Change a quantity | `PUT /carts/{cartId}/product/quantity` | No |
| Remove a product | `DELETE /carts/{cartId}/product/{productId}` | No |
| Delete a cart | `DELETE /carts/{cartId}` | No |

| ID | Title | Priority | Basis |
|---|---|---|---|
| API-CRT-01 | Creating a cart | High | Documented in contract |
| API-CRT-02 | A new cart is empty | Medium | Seen in live response |
| API-CRT-03 | Adding a product to the cart | High | Documented in contract |
| API-CRT-04 | Adding the same product again adds up the quantity | Medium | Seen in live response |
| API-CRT-05 | Adding with an empty request is refused | Medium | Documented in contract |
| API-CRT-06 | Adding without each required detail is refused | Medium | Documented in contract |
| API-CRT-07 | Adding with the wrong kind of value is refused | Medium | Seen in live response |
| API-CRT-08 | Adding a quantity below 1 is refused | Medium | Seen in live response |
| API-CRT-09 | Adding a product that doesn't exist is refused | Medium | Seen in live response |
| API-CRT-10 | Adding to a cart that doesn't exist | Medium | Documented in contract |
| API-CRT-11 | Reading a cart that doesn't exist | Medium | Documented in contract |
| API-CRT-12 | Reading a cart with a badly formed ID | Low | Seen in live response |
| API-CRT-13 | Changing a product's quantity | High | Documented in contract |
| API-CRT-14 | Changing a quantity to something invalid is refused | Medium | Seen in live response |
| API-CRT-15 | Changing the quantity of a product that isn't in the cart | Low | Needs confirming |
| API-CRT-16 | Changing a quantity in a cart that doesn't exist | Medium | Documented in contract |
| API-CRT-17 | Removing a product from the cart | High | Documented in contract |
| API-CRT-18 | Removing a product from a cart that doesn't exist | Low | Documented in contract |
| API-CRT-19 | Removing a product that isn't in the cart | Low | Seen in live response |
| API-CRT-20 | Deleting a cart | Medium | Documented in contract |
| API-CRT-21 | Deleting a cart that doesn't exist | Low | Documented in contract |
| API-CRT-22 | Unsupported methods on the cart address are refused | Low | Documented in contract |

---

### API-CRT-01 — Creating a cart

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `POST /carts`
- **Before you start:** Nothing.
- **Request:** Ask for a new cart.
- **Expected response:** **201 Created** with the new cart's ID.
- **Basis:** Documented in contract
- **Changes data:** Yes — creates a cart. Clean up by deleting the cart (API-CRT-20).
- **Contract reference:** `POST /carts`: documented responses 201, 404, 405, 422

### API-CRT-02 — A new cart is empty

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /carts/{cartId}`
- **Before you start:** Create a cart.
- **Request:** Read that cart.
- **Expected response:** **200 OK**. The cart has the same ID and no items.
- **Basis:** Seen in live response (the contract documents the cart as an ID only; see finding 18)
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `GET /carts/{cartId}`: documented responses 200 (CartResponse), 404, 405

### API-CRT-03 — Adding a product to the cart

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart. Take the first product from the product list.
- **Request:** Add 2 of that product to the cart. Then read the cart.
- **Expected response:** **200 OK**, saying the item was added or updated. The cart then has one item: that product, quantity 2, with its name and price.
- **Basis:** Documented in contract (the add response); cart contents seen in live response
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: documented responses 200, 404, 405, 422

### API-CRT-04 — Adding the same product again adds up the quantity

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart and add 2 of a product.
- **Request:** Add 1 more of the same product. Then read the cart.
- **Expected response:** **200 OK**. The cart still has one line for that product, now with quantity 3.
- **Basis:** Seen in live response
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`

### API-CRT-05 — Adding with an empty request is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart.
- **Request:** Add to the cart without any details.
- **Expected response:** **422 Unprocessable Entity**, saying both the product and the quantity are required. The cart stays empty.
- **Basis:** Documented in contract (422); messages seen in live response
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: required product_id, quantity

### API-CRT-06 — Adding without each required detail is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart. Take the first product from the list.
- **Request:** Add the product with quantity 1, leaving out one detail at a time.
- **Variations:**

  | Left out |
  |---|
  | product (product_id) |
  | quantity (quantity) |

- **Expected response:** **422 Unprocessable Entity** for each, naming only the missing detail.
- **Basis:** Documented in contract (required details); messages seen in live response
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: required product_id, quantity

### API-CRT-07 — Adding with the wrong kind of value is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart. Take the first product from the list.
- **Request:** Add the product with one detail of the wrong kind.
- **Variations:**

  | Detail | Value sent |
  |---|---|
  | product | a number |
  | product | a yes/no value |
  | quantity | text ("two") |
  | quantity | an empty value |

- **Expected response:** **422 Unprocessable Entity** for each, naming the detail (the product must be text, the quantity must be a whole number or is required).
- **Basis:** Seen in live response
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: product_id text, quantity whole number

### API-CRT-08 — Adding a quantity below 1 is refused

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart. Take the first product from the list.
- **Request:** Add the product with a quantity below 1.
- **Variations:**

  | Quantity |
  |---|
  | 0 |
  | -1 |

- **Expected response:** **422 Unprocessable Entity** for each, saying the quantity must be at least 1.
- **Basis:** Seen in live response
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: quantity

### API-CRT-09 — Adding a product that doesn't exist is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Create a cart.
- **Request:** Add a well-formed product ID that doesn't exist, quantity 1.
- **Expected response:** **422 Unprocessable Entity**, saying the selected product is invalid.
- **Basis:** Seen in live response
- **Changes data:** Yes — creates a cart. Clean up by deleting it.
- **Contract reference:** `POST /carts/{id}`: 422

### API-CRT-10 — Adding to a cart that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `POST /carts/{id}`
- **Before you start:** Take the first product from the list.
- **Request:** Add that product to a well-formed cart ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the cart wasn't found.
- **Basis:** Documented in contract (404)
- **Changes data:** No
- **Contract reference:** `POST /carts/{id}`: 404

### API-CRT-11 — Reading a cart that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `GET /carts/{cartId}`
- **Before you start:** Nothing.
- **Request:** Read a well-formed cart ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the requested item wasn't found.
- **Basis:** Documented in contract (404 ItemNotFoundResponse)
- **Changes data:** No
- **Contract reference:** `GET /carts/{cartId}`: 404

### API-CRT-12 — Reading a cart with a badly formed ID

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /carts/{cartId}`
- **Before you start:** Nothing.
- **Request:** Read a cart with an ID that isn't a real ID.
- **Variations:**

  | Cart ID |
  |---|
  | text ("abc") |
  | a number ("123") |
  | a database injection attempt |
  | a script tag |

- **Expected response:** **404 Not Found** for each, with no server error.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /carts/{cartId}`: 404

### API-CRT-13 — Changing a product's quantity

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `PUT /carts/{cartId}/product/quantity`
- **Before you start:** Create a cart and add 2 of a product.
- **Request:** Change that product's quantity to 5. Then read the cart.
- **Expected response:** **200 OK**. The cart shows quantity 5 for that product (not 7).
- **Basis:** Documented in contract (200); response wording and cart contents seen in live response
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `PUT /carts/{cartId}/product/quantity`: documented responses 200, 404, 405, 422

### API-CRT-14 — Changing a quantity to something invalid is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `PUT /carts/{cartId}/product/quantity`
- **Before you start:** Create a cart and add 2 of a product.
- **Request:** Change the quantity with one problem at a time.
- **Variations:**

  | Sent | Problem |
  |---|---|
  | nothing at all | product and quantity required |
  | the product, no quantity | quantity required |
  | quantity as text ("two") | not a whole number |
  | quantity 0 | below 1 |

- **Expected response:** **422 Unprocessable Entity** for each, naming the problem. The cart still shows quantity 2.
- **Basis:** Seen in live response
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `PUT /carts/{cartId}/product/quantity`: 422

### API-CRT-15 — Changing the quantity of a product that isn't in the cart

- **Priority:** Low
- **Type:** Business rule
- **Endpoint:** `PUT /carts/{cartId}/product/quantity`
- **Before you start:** Create a cart and add a product.
- **Request:** Change the quantity of a different product that isn't in the cart.
- **Expected response:** **404 Not Found**, because there's nothing to change. The cart still has only the first product.
- **Basis:** Needs confirming (the contract documents 404 ResourceNotFoundResponse but doesn't say when)
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `PUT /carts/{cartId}/product/quantity`: 404
- **Notes:** The live service answers **200 OK** and adds the product to the cart. That may be intended ("item added or updated"). Product owner to decide (finding 21).

### API-CRT-16 — Changing a quantity in a cart that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `PUT /carts/{cartId}/product/quantity`
- **Before you start:** Take the first product from the list.
- **Request:** Change that product's quantity in a well-formed cart ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the cart doesn't exist.
- **Basis:** Documented in contract (404)
- **Changes data:** No
- **Contract reference:** `PUT /carts/{cartId}/product/quantity`: 404

### API-CRT-17 — Removing a product from the cart

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `DELETE /carts/{cartId}/product/{productId}`
- **Before you start:** Create a cart and add two different products.
- **Request:** Remove the second product. Then read the cart.
- **Expected response:** **204 No Content**, with no response body. The cart now has only the first product.
- **Basis:** Documented in contract
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `DELETE /carts/{cartId}/product/{productId}`: documented responses 204, 401, 404, 405, 409, 422

### API-CRT-18 — Removing a product from a cart that doesn't exist

- **Priority:** Low
- **Type:** Not found
- **Endpoint:** `DELETE /carts/{cartId}/product/{productId}`
- **Before you start:** Take the first product from the list.
- **Request:** Remove that product from a well-formed cart ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the cart doesn't exist.
- **Basis:** Documented in contract (404)
- **Changes data:** No
- **Contract reference:** `DELETE /carts/{cartId}/product/{productId}`: 404

### API-CRT-19 — Removing a product that isn't in the cart

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `DELETE /carts/{cartId}/product/{productId}`
- **Before you start:** Create a cart and add a product.
- **Request:** Remove a different product that isn't in the cart.
- **Expected response:** **204 No Content**: nothing to remove is not an error. The cart still has the first product.
- **Basis:** Seen in live response
- **Changes data:** Yes — fills a cart. Clean up by deleting it.
- **Contract reference:** `DELETE /carts/{cartId}/product/{productId}`

### API-CRT-20 — Deleting a cart

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `DELETE /carts/{cartId}`
- **Before you start:** Create a cart and add a product.
- **Request:** Delete the cart. Then try to read it.
- **Expected response:** **204 No Content**, with no response body. Reading the cart afterwards gives **404 Not Found**.
- **Basis:** Documented in contract
- **Changes data:** Yes — removes the cart this case created. Nothing left to clean up.
- **Contract reference:** `DELETE /carts/{cartId}`: documented responses 204, 401, 404, 405, 409, 422

### API-CRT-21 — Deleting a cart that doesn't exist

- **Priority:** Low
- **Type:** Not found
- **Endpoint:** `DELETE /carts/{cartId}`
- **Before you start:** Nothing.
- **Request:** Delete a well-formed cart ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the cart doesn't exist.
- **Basis:** Documented in contract (404 ResourceNotFoundResponse)
- **Changes data:** No
- **Contract reference:** `DELETE /carts/{cartId}`: 404

### API-CRT-22 — Unsupported methods on the cart address are refused

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /carts`
- **Before you start:** Nothing.
- **Request:** Ask for the list of all carts (reading is only supported for one cart at a time).
- **Expected response:** **405 Method Not Allowed**, saying the method isn't allowed for this route.
- **Basis:** Documented in contract (405 MethodNotAllowedResponse)
- **Changes data:** No
- **Contract reference:** `/carts`: 405
