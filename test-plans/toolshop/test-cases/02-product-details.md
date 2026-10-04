# Product details — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** A single product's page: its information, choosing a quantity, adding to the cart and favourites, and related products.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-PRD-01 | Opening a product from the catalogue | High | Seen during exploration |
| TC-PRD-02 | Quantity can't go below 1 or above 99 | Low | Confirmed by run |
| TC-PRD-03 | Adding to the cart updates the cart icon | High | Seen during exploration |
| TC-PRD-04 | Adding to favourites when not signed in | Low | Confirmed by run |
| TC-PRD-05 | Opening a related product | Low | Confirmed by run |

---

### TC-PRD-01 — Opening a product from the catalogue

- **Priority:** High
- **Type:** Navigation
- **Before you start:** On the home page.
- **Steps:**
  1. Click the product **Combination Pliers**.
- **Expected result:** The product page opens with the title **Combination Pliers**, a price, and a quantity of **1**. The buttons **Add to cart**, **Add to favourites** and **Compare** are shown, along with a **Related products** section.
- **Basis:** Seen during exploration
- **Map reference:** P1

### TC-PRD-02 — Quantity can't go below 1 or above 99

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On any product page.
- **Steps:**
  1. With the quantity at 1, click **Decrease quantity**.
  2. Set the quantity to 99 and click **Increase quantity**.
- **Expected result:** The quantity stays at 1 in step 1, and stays at 99 in step 2.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** P1
- **Notes:** Confirmed by the automated run on 2026-10-05.

### TC-PRD-03 — Adding to the cart updates the cart icon

- **Priority:** High
- **Type:** Functional
- **Before you start:** The cart is empty. On the **Combination Pliers** product page.
- **Steps:**
  1. Set the quantity to **2**.
  2. Click **Add to cart**.
- **Expected result:** A cart icon appears in the top menu, showing **2**.
- **Basis:** Seen during exploration
- **Map reference:** P2
- **Notes:** A short confirmation message may also appear briefly. Don't rely on it; check the cart icon.

### TC-PRD-04 — Adding to favourites when not signed in

- **Priority:** Low
- **Type:** Negative
- **Before you start:** Not signed in. On any product page.
- **Steps:**
  1. Click **Add to favourites**.
- **Expected result:** A message says **Unauthorized, can not add product to your favorite list.**, and the product isn't added.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** P1

### TC-PRD-05 — Opening a related product

- **Priority:** Low
- **Type:** Navigation
- **Before you start:** On the **Combination Pliers** product page.
- **Steps:**
  1. Under **Related products**, click **Pliers**.
- **Expected result:** The **Pliers** product page opens.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** P1
