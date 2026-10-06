# Products — Toolshop API

Part of the [Toolshop API test plan](../test-plan.md).

**What this covers:** Listing, filtering, sorting and paging the catalogue, reading one product and its related products, and searching. For the operations that change the catalogue (create, replace, change, delete), it covers only that they refuse people who aren't allowed. Successful catalogue changes need the admin account and would change the shared demo, so they're out of scope (see the plan, section 2).

| Operation | Endpoint | Auth |
|---|---|---|
| List products | `GET /products` | No |
| Read a product | `GET /products/{productId}` | No |
| Related products | `GET /products/{productId}/related` | No |
| Search products | `GET /products/search` | No |
| Create a product | `POST /products` | No (see finding 2) |
| Replace a product | `PUT /products/{productId}` | No (see finding 2) |
| Change some of a product | `PATCH /products/{productId}` | No (see finding 2) |
| Delete a product | `DELETE /products/{productId}` | Yes |

| ID | Title | Priority | Basis |
|---|---|---|---|
| API-PRD-01 | Listing the first page of products | High | Documented in contract |
| API-PRD-02 | Moving through the pages | Medium | Seen in live response |
| API-PRD-03 | Page numbers that don't make sense show the first page | Low | Seen in live response |
| API-PRD-04 | Filtering by category | Medium | Documented in contract |
| API-PRD-05 | Filtering by brand | Medium | Documented in contract |
| API-PRD-06 | Limiting the price range | Medium | Documented in contract |
| API-PRD-07 | Showing only rental products | Low | Documented in contract |
| API-PRD-08 | Sorting the list | Medium | Documented in contract |
| API-PRD-09 | Sorting by something unknown is refused | Low | Needs confirming |
| API-PRD-10 | Reading one product | High | Documented in contract |
| API-PRD-11 | Reading a product that doesn't exist | Medium | Documented in contract |
| API-PRD-12 | Reading a product with a badly formed ID | Low | Seen in live response |
| API-PRD-13 | Related products come from the same category | Medium | Seen in live response |
| API-PRD-14 | Related products for a product that doesn't exist | Low | Documented in contract |
| API-PRD-15 | Searching by name | High | Documented in contract |
| API-PRD-16 | Searching with no matches | Medium | Seen in live response |
| API-PRD-17 | Searching without a search phrase is refused | Low | Documented in contract |
| API-PRD-18 | Deleting a product without an access key is refused | Medium | Documented in contract |
| API-PRD-19 | A customer can't delete a product | Medium | Seen in live response |
| API-PRD-20 | Creating a product without an access key is refused | High | Needs confirming |
| API-PRD-21 | Changing a product without an access key is refused | High | Needs confirming |
| API-PRD-22 | Unsupported methods on product addresses are refused | Low | Documented in contract |

---

### API-PRD-01 — Listing the first page of products

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Nothing. Any visitor.
- **Request:** Ask for the list of products, with no filters.
- **Expected response:** **200 OK**. The response has the documented page of products: page 1, nine products, and the paging details (total, last page, items per page). Every product has an ID, name and price, plus its brand, category and image.
- **Basis:** Documented in contract (shape); nine per page seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products`: documented responses 200 (paginated ProductResponse), 404, 405

### API-PRD-02 — Moving through the pages

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for page 2, then for a page far beyond the last one (page 999).
- **Expected response:** **200 OK** for both. Page 2 has different products from page 1. The page beyond the end has no products but still reports the correct total and last page.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products`: page

### API-PRD-03 — Page numbers that don't make sense show the first page

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for the product list with a page number that isn't a positive number.
- **Variations:**

  | Page |
  |---|
  | 0 |
  | -1 |
  | text ("abc") |

- **Expected response:** **200 OK** for each, showing page 1. No server error.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products`: page (whole number)

### API-PRD-04 — Filtering by category

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Take the category ID of the first product in the list.
- **Request:** Ask for the product list filtered by that category.
- **Expected response:** **200 OK**. Every product returned belongs to that category.
- **Basis:** Documented in contract (by_category filter)
- **Changes data:** No
- **Contract reference:** `GET /products`: by_category

### API-PRD-05 — Filtering by brand

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Take the brand ID of the first product in the list.
- **Request:** Ask for the product list filtered by that brand.
- **Expected response:** **200 OK**. Every product returned has that brand.
- **Basis:** Documented in contract (by_brand filter)
- **Changes data:** No
- **Contract reference:** `GET /products`: by_brand

### API-PRD-06 — Limiting the price range

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for products priced between 10 and 30.
- **Expected response:** **200 OK**. At least one product is returned, and every price is between 10 and 30.
- **Basis:** Documented in contract (between filter, "price,10,30")
- **Changes data:** No
- **Contract reference:** `GET /products`: between

### API-PRD-07 — Showing only rental products

- **Priority:** Low
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for rental products only.
- **Expected response:** **200 OK**. At least one product is returned, and every one is marked as a rental.
- **Basis:** Documented in contract (is_rental filter)
- **Changes data:** No
- **Contract reference:** `GET /products`: is_rental

### API-PRD-08 — Sorting the list

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for the product list sorted in each supported way.
- **Variations:**

  | Sort |
  |---|
  | price, lowest first |
  | price, highest first |
  | name, A to Z |
  | name, Z to A |

- **Expected response:** **200 OK** for each. The products on the page are in that order.
- **Basis:** Documented in contract (sort parameter); the exact sort values were seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products`: sort

### API-PRD-09 — Sorting by something unknown is refused

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /products`
- **Before you start:** Nothing.
- **Request:** Ask for the product list sorted by **nonsense**.
- **Expected response:** Either the unknown sort is ignored (**200 OK**, default order) or refused as invalid (**422 Unprocessable Entity**). Never a server error.
- **Basis:** Needs confirming (the contract doesn't list the allowed sort values)
- **Changes data:** No
- **Contract reference:** `GET /products`: sort
- **Notes:** The live service answers **500 Internal Server Error**. See finding 7.

### API-PRD-10 — Reading one product

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /products/{productId}`
- **Before you start:** Take the first product from the list.
- **Request:** Ask for that product by its ID.
- **Expected response:** **200 OK** with the documented product details. The name and price match the list entry.
- **Basis:** Documented in contract
- **Changes data:** No
- **Contract reference:** `GET /products/{productId}`: documented responses 200 (ProductResponse), 404, 405

### API-PRD-11 — Reading a product that doesn't exist

- **Priority:** Medium
- **Type:** Not found
- **Endpoint:** `GET /products/{productId}`
- **Before you start:** Nothing.
- **Request:** Ask for a product with a well-formed ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the requested item wasn't found.
- **Basis:** Documented in contract (404 ItemNotFoundResponse)
- **Changes data:** No
- **Contract reference:** `GET /products/{productId}`: 404

### API-PRD-12 — Reading a product with a badly formed ID

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `GET /products/{productId}`
- **Before you start:** Nothing.
- **Request:** Ask for a product with an ID that isn't a real ID.
- **Variations:**

  | Product ID |
  |---|
  | text ("abc") |
  | a number ("123") |
  | a yes/no word ("true") |
  | a database injection attempt |
  | a script tag |

- **Expected response:** **404 Not Found** for each, with no server error.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products/{productId}`: 404

### API-PRD-13 — Related products come from the same category

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `GET /products/{productId}/related`
- **Before you start:** Take the first product from the list.
- **Request:** Ask for that product's related products.
- **Expected response:** **200 OK** with a list of products in the documented shape. The list doesn't include the product itself, and every related product is in the same category.
- **Basis:** Seen in live response (the contract documents only the shape)
- **Changes data:** No
- **Contract reference:** `GET /products/{productId}/related`: 200 (list of ProductResponse), 404, 405

### API-PRD-14 — Related products for a product that doesn't exist

- **Priority:** Low
- **Type:** Not found
- **Endpoint:** `GET /products/{productId}/related`
- **Before you start:** Nothing.
- **Request:** Ask for related products of a well-formed product ID that doesn't exist.
- **Expected response:** **404 Not Found**, saying the requested item wasn't found.
- **Basis:** Documented in contract (404)
- **Changes data:** No
- **Contract reference:** `GET /products/{productId}/related`: 404
- **Notes:** The live service answers **500 Internal Server Error**. See finding 7.

### API-PRD-15 — Searching by name

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /products/search`
- **Before you start:** Nothing.
- **Request:** Search for **pliers**.
- **Expected response:** **200 OK** with a page of products in the documented shape. At least one product is returned, and every name contains "pliers" (any capitalisation).
- **Basis:** Documented in contract
- **Changes data:** No
- **Contract reference:** `GET /products/search`: documented responses 200, 404, 405

### API-PRD-16 — Searching with no matches

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /products/search`
- **Before you start:** Nothing.
- **Request:** Search for a word no product has.
- **Expected response:** **200 OK** with an empty page: no products, total of 0.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `GET /products/search`: 200

### API-PRD-17 — Searching without a search phrase is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `GET /products/search`
- **Before you start:** Nothing.
- **Request:** Search without giving a search phrase.
- **Expected response:** Refused as invalid (**422 Unprocessable Entity**), because the search phrase is required.
- **Basis:** Documented in contract (search phrase required)
- **Changes data:** No
- **Contract reference:** `GET /products/search`: q (required)
- **Notes:** The live service answers **200 OK** with an empty page. See finding 16.

### API-PRD-18 — Deleting a product without an access key is refused

- **Priority:** Medium
- **Type:** Authentication
- **Endpoint:** `DELETE /products/{productId}`
- **Before you start:** Take the first product from the list.
- **Request:** Try to delete that product, once without an access key and once with an invalid one.
- **Expected response:** **401 Unauthorized** for both. The product is still in the catalogue.
- **Basis:** Documented in contract (401)
- **Changes data:** No (if refused)
- **Contract reference:** `DELETE /products/{productId}`: 401

### API-PRD-19 — A customer can't delete a product

- **Priority:** Medium
- **Type:** Authorisation
- **Endpoint:** `DELETE /products/{productId}`
- **Before you start:** Register a customer and log in. Take the first product from the list.
- **Request:** Try to delete that product as the customer.
- **Expected response:** **403 Forbidden**. The product is still in the catalogue.
- **Basis:** Seen in live response (403 isn't documented for this operation; see finding 12)
- **Changes data:** No (if refused). Creates a throwaway customer.
- **Contract reference:** `DELETE /products/{productId}`: documented responses 204, 401, 404, 405, 409, 422

### API-PRD-20 — Creating a product without an access key is refused

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** `POST /products`
- **Before you start:** Nothing.
- **Request:** Try to create a product without an access key, sending no product details (so nothing can be created even if the check is missing).
- **Expected response:** **401 Unauthorized**. Creating products is an admin task.
- **Basis:** Needs confirming (the contract doesn't mark this operation as protected; see finding 2)
- **Changes data:** No
- **Contract reference:** `POST /products`: documented responses 200, 404, 405, 422
- **Notes:** The live service skips the sign-in check and goes straight to validation (**422 Unprocessable Entity**, listing the missing product details).

### API-PRD-21 — Changing a product without an access key is refused

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** `PUT /products/{productId}`, `PATCH /products/{productId}`
- **Before you start:** Take the first product from the list.
- **Request:** Try to change that product without an access key, sending no changes (so nothing changes even if the check is missing).
- **Variations:**

  | Method |
  |---|
  | replace all details |
  | change some details |

- **Expected response:** **401 Unauthorized** for both. Changing products is an admin task.
- **Basis:** Needs confirming (the contract doesn't mark these operations as protected; see finding 2)
- **Changes data:** No (nothing is sent to change)
- **Contract reference:** `PUT /products/{productId}`, `PATCH /products/{productId}`: documented responses 200, 404, 405, 422
- **Notes:** The live service answers **200 OK** ("success") to an anonymous replace request: anybody can change the catalogue.

### API-PRD-22 — Unsupported methods on product addresses are refused

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `PATCH /products`, `POST /products/{productId}`
- **Before you start:** Take the first product from the list.
- **Request:** Send a request with a method the address doesn't support.
- **Variations:**

  | Request |
  |---|
  | change (PATCH) on the product list |
  | create (POST) on a product |

- **Expected response:** **405 Method Not Allowed** for each, saying the method isn't allowed for this route.
- **Basis:** Documented in contract (405 MethodNotAllowedResponse)
- **Changes data:** No
- **Contract reference:** `/products`, `/products/{productId}`: 405
