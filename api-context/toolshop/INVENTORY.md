# API inventory — Toolshop API

| | |
|---|---|
| Contract | https://api.practicesoftwaretesting.com/docs?api-docs.json (OpenAPI 3.2.0, version 5.0.0) |
| Server | https://api.practicesoftwaretesting.com, http://localhost:8091 |
| Generated | 2026-10-04 by scripts/api-context/inventory.mjs |
| Operations | 88 in 15 groups |

Generated from the contract. Do not edit by hand; re-run the script when the contract changes. "Auth" = the operation declares a security requirement.

## Brand

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/brands` | Retrieve all brands | no | — | — | 200 (BrandResponse), 404, 405 |
| POST | `/brands` | Store new brand | no | — | BrandRequest: none required | 201 (BrandResponse), 404, 405, 409, 422 |
| GET | `/brands/{brandId}` | Retrieve specific brand | no | brandId | — | 200 (BrandResponse), 404, 405 |
| PUT | `/brands/{brandId}` | Update specific brand | no | brandId | BrandRequest: none required | 200, 404, 405, 409, 422 |
| PATCH | `/brands/{brandId}` | Partially update specific brand | no | brandId | BrandRequest: none required | 200, 404, 405, 409, 422 |
| DELETE | `/brands/{brandId}` | Delete specific brand | yes | brandId | — | 204, 401, 404, 405, 409, 422 |
| GET | `/brands/search` | Retrieve specific brands matching the search query | no | — | — | 200 (BrandResponse), 404, 405 |
| QUERY | `/brands/search` | Retrieve specific brands matching the search query (HTTP QUERY) | no | — | q | 200 (BrandResponse), 415 |

## Cart

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| POST | `/carts` | Create a new cart | no | — | — | 201, 404, 405, 422 |
| POST | `/carts/{id}` | Add item to cart | no | id | product_id, quantity | 200, 404, 405, 422 |
| GET | `/carts/{cartId}` | Retrieve specific cart | no | cartId | — | 200 (CartResponse), 404, 405 |
| DELETE | `/carts/{cartId}` | Delete Cart | no | cartId | — | 204, 401, 404, 405, 409, 422 |
| PUT | `/carts/{cartId}/product/quantity` | Update quantity of item in cart | no | cartId | product_id, quantity | 200, 404, 405, 422 |
| DELETE | `/carts/{cartId}/product/{productId}` | Delete product from cart | no | cartId, productId | — | 204, 401, 404, 405, 409, 422 |

## Category

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/categories/tree` | Retrieve all categories (including subcategories) | no | — | — | 200 (CategoryTreeResponse), 404, 405 |
| QUERY | `/categories/tree` | Retrieve all categories including subcategories (HTTP QUERY) | no | — | none required | 200 (CategoryTreeResponse), 415 |
| GET | `/categories` | Retrieve all categories | no | — | — | 200 (CategoryResponse), 404, 405 |
| POST | `/categories` | Store new category | no | — | CategoryRequest: none required | 201 (CategoryResponse), 404, 405, 409, 422 |
| GET | `/categories/tree/{categoryId}` | Retrieve specific category (including subcategories) | no | categoryId | — | 200 (CategoryTreeResponse), 404, 405 |
| GET | `/categories/search` | Retrieve specific categories matching the search query | no | — | — | 200 (CategoryResponse), 404, 405 |
| QUERY | `/categories/search` | Retrieve specific categories matching the search query (HTTP QUERY) | no | — | q | 200 (CategoryResponse), 415 |
| PUT | `/categories/{categoryId}` | Update specific category | no | categoryId | CategoryRequest: none required | 200, 404, 405, 409, 422 |
| PATCH | `/categories/{categoryId}` | Partially update specific category | no | categoryId | CategoryRequest: none required | 200, 404, 405, 409, 422 |
| DELETE | `/categories/{categoryId}` | Delete specific category | yes | categoryId | — | 204, 401, 404, 405, 409, 422 |

## Contact

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/messages` | Retrieve messages | yes | — | — | 200, 401, 404, 405 |
| POST | `/messages` | Send new contact message | no | — | ContactRequest: subject, message | 200, 404, 405 |
| POST | `/messages/{messageId}/attach-file` | Attach file to contact message | no | messageId | none required | 200, 404, 405 |
| GET | `/messages/{messageId}` | Retrieve specific message | yes | messageId | — | 200, 401, 404, 405 |
| POST | `/messages/{messageId}/reply` | Send new contact message | yes | messageId | ContactRequest: subject, message | 200 (ContactReplyResponse), 401, 404, 405 |
| PUT | `/messages/{messageId}/status` | Set a new message status | yes | messageId | none required | 200, 401, 404, 405 |

## Favorite

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/favorites` | Retrieve all favorites | yes | — | — | 200 (FavoriteWithProductResponse), 401, 404, 405 |
| POST | `/favorites` | Store new favorite | yes | — | FavoriteRequest: none required | 200 (FavoriteResponse), 401, 404, 405, 409, 422 |
| GET | `/favorites/{favoriteId}` | Retrieve specific favorite | yes | favoriteId | — | 200 (FavoriteResponse), 401, 404, 405 |
| DELETE | `/favorites/{favoriteId}` | Delete specific favorite | yes | favoriteId | — | 204, 401, 404, 405, 409, 422 |

## Image

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/images` | Retrieve all images | no | — | — | 200 (ImageResponse), 404, 405 |

## Invoice

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/invoices` | Retrieve all invoices | yes | — | — | 200, 401, 404, 405 |
| POST | `/invoices` | Store new invoice | yes | — | InvoiceRequest: billing_street, billing_city, billing_state, billing_country, billing_postal_code, payment_method, payment_details, cart_id | 200 (InvoiceResponse), 401, 404, 405, 422 |
| POST | `/invoices/guest` | Store new guest invoice | no | — | none required | 200 (InvoiceResponse), 422 |
| GET | `/invoices/{invoiceId}` | Retrieve specific invoice | yes | invoiceId | — | 200 (InvoiceResponse), 401, 404, 405 |
| PUT | `/invoices/{invoiceId}` | Update specific invoice | yes | invoiceId | InvoiceRequest: billing_street, billing_city, billing_state, billing_country, billing_postal_code, payment_method, payment_details, cart_id | 200, 401, 404, 405, 422 |
| PATCH | `/invoices/{invoiceId}` | Partially update specific invoice | yes | invoiceId | InvoiceRequest: billing_street, billing_city, billing_state, billing_country, billing_postal_code, payment_method, payment_details, cart_id | 200, 401, 404, 405, 422 |
| GET | `/invoices/{invoice_number}/download-pdf` | Download already generated PDF of a specific invoice | yes | invoice_number | — | 200 (InvoiceResponse), 401, 404, 405 |
| GET | `/invoices/{invoice_number}/download-pdf-status` | Retrieve the status of the PDF. | yes | invoice_number | — | 200 (InvoiceResponse), 401, 404, 405 |
| PUT | `/invoices/{invoiceId}/status` | Update invoice status | yes | invoiceId | none required | 200, 401, 404, 405, 422 |
| GET | `/invoices/search` | Retrieve specific invoices matching the search query | yes | — | — | 200, 401, 404, 405 |
| QUERY | `/invoices/search` | Retrieve specific invoices matching the search query (HTTP QUERY) | yes | — | q | 200, 401, 415 |

## Payment

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| POST | `/payment/check` | Check payment | no | — | PaymentRequest: none required | 200 |

## Postcode

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/postcode-lookup` | Lookup address details by postcode | no | — | — | 200, 422, 502 |

## Product

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/products` | Retrieve all products | no | — | — | 200, 404, 405 |
| POST | `/products` | Store new product | no | — | ProductRequest: none required | 200 (ProductResponse), 404, 405, 422 |
| QUERY | `/products` | Retrieve all products (HTTP QUERY) | no | — | none required | 200, 415 |
| GET | `/products/{productId}` | Retrieve specific product | no | productId | — | 200 (ProductResponse), 404, 405 |
| PUT | `/products/{productId}` | Update specific product | no | productId | ProductRequest: none required | 200, 404, 405, 422 |
| PATCH | `/products/{productId}` | Partially update specific product | no | productId | ProductRequest: none required | 200, 404, 405, 422 |
| DELETE | `/products/{productId}` | Delete specific product | yes | productId | — | 204, 401, 404, 405, 409, 422 |
| GET | `/products/{productId}/related` | Retrieve related products | no | productId | — | 200 (ProductResponse), 404, 405 |
| GET | `/products/search` | Retrieve specific products matching the search query | no | — | — | 200, 404, 405 |
| QUERY | `/products/search` | Retrieve specific products matching the search query (HTTP QUERY) | no | — | q | 200, 415 |

## Product Spec

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/products/{productId}/specs` | Retrieve specs for a product | no | productId | — | 200 (ProductSpecResponse) |
| POST | `/products/{productId}/specs` | Add a spec to a product | yes | productId | spec_name, spec_value | 201 (ProductSpecResponse), 401, 422 |
| GET | `/products/{productId}/specs/{specId}` | Retrieve a specific spec | no | productId, specId | — | 200 (ProductSpecResponse) |
| PUT | `/products/{productId}/specs/{specId}` | Update a spec | yes | productId, specId | none required | 200, 401 |
| DELETE | `/products/{productId}/specs/{specId}` | Delete a spec | yes | productId, specId | — | 204, 401 |
| GET | `/product-specs/names` | Retrieve all distinct spec names with their values | no | — | — | 200 |

## Report

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/reports/total-sales-per-country` | Get total sales per country | yes | — | — | 200, 401, 404 |
| GET | `/reports/top10-purchased-products` | Get top 10 purchased products | yes | — | — | 200, 401, 404 |
| GET | `/reports/top10-best-selling-categories` | Get top 10 best selling categories | yes | — | — | 200, 401, 404 |
| GET | `/reports/total-sales-of-years` | Get total sales of years | yes | — | — | 200, 401, 404 |
| GET | `/reports/average-sales-per-month` | Get average sales per month | yes | — | — | 200, 401, 404 |
| GET | `/reports/average-sales-per-week` | Get average sales per week | yes | — | — | 200, 401, 404 |
| GET | `/reports/customers-by-country` | Get customers by country | yes | — | — | 200, 401, 404 |

## Stream

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/sales-stream` | Live sales feed over Server-Sent Events (SSE) | no | — | — | 200 |

## TOTP

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| POST | `/totp/setup` | Setup TOTP for the authenticated user | yes | — | — | 200, 400 |
| POST | `/totp/verify` | Verify TOTP code for the authenticated user | yes | — | none required | 200, 400 |

## User

| Method | Path | Summary | Auth | Path params | Request body (required fields) | Documented responses |
|---|---|---|---|---|---|---|
| GET | `/users` | Retrieve all users | yes | — | — | 200, 400, 401 |
| POST | `/users/register` | Store new user | no | — | UserRequest: first_name, last_name, email, password | 201 (UserResponse), 400, 401, 403, 409 |
| POST | `/users/login` | Login customer | no | — | email, password | 200 |
| POST | `/users/forgot-password` | Request a new password | no | — | none required | 200, 400, 401, 403 |
| POST | `/users/change-password` | Change password | yes | — | none required | 200, 401 |
| GET | `/users/me` | Retrieve current customer info | yes | — | — | 200 (UserResponse), 401 |
| GET | `/users/logout` | Logout - invalidate the token | yes | — | — | 200, 400, 401 |
| GET | `/users/refresh` | Retrieve a refreshed token | yes | — | — | 200, 400, 401 |
| GET | `/users/{userId}` | Retrieve specific user | yes | userId | — | 200 (UserResponse), 401, 404, 405 |
| PUT | `/users/{userId}` | Update specific user | yes | userId | UserRequest: first_name, last_name, email, password | 200, 401, 403, 405, 409, 422 |
| PATCH | `/users/{userId}` | Partially update specific user | yes | userId | UserRequest: first_name, last_name, email, password | 200, 401, 403, 405, 409, 422 |
| DELETE | `/users/{userId}` | Delete specific user | yes | userId | — | 204, 401, 403, 404, 405, 409 |
| GET | `/users/search` | Retrieve specific users matching the search query | yes | — | — | 200 (UserResponse), 401, 404 |
| QUERY | `/users/search` | Retrieve specific users matching the search query (HTTP QUERY) | yes | — | q | 200 (UserResponse), 401, 415 |

