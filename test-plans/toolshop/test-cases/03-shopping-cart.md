# Shopping cart — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** The cart (the first step of checkout): the items, their totals, changing quantities, removing items and returning to the shop.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-CRT-01 | Cart shows the right line and total prices | High | Seen during exploration |
| TC-CRT-02 | Changing a quantity updates the totals | Medium | Needs confirming |
| TC-CRT-03 | Removing an item | Medium | Needs confirming |
| TC-CRT-04 | Continuing to shop keeps the cart | Low | Needs confirming |

---

### TC-CRT-01 — Cart shows the right line and total prices

- **Priority:** High
- **Type:** Calculation
- **Before you start:** Two **Combination Pliers** are in the cart (TC-PRD-03).
- **Steps:**
  1. Click the cart icon in the top menu.
- **Expected result:** The cart lists **Combination Pliers** with quantity **2** and price **$14.15**. The line total and the cart total both show **$28.30**.
- **Basis:** Seen during exploration
- **Map reference:** K1

### TC-CRT-02 — Changing a quantity updates the totals

- **Priority:** Medium
- **Type:** Calculation
- **Before you start:** One product in the cart. Viewing the cart.
- **Steps:**
  1. Change the product's quantity to **3**.
- **Expected result:** The line total and cart total become three times the product's price.
- **Basis:** Needs confirming
- **Map reference:** K1

### TC-CRT-03 — Removing an item

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** Exactly one product in the cart. Viewing the cart.
- **Steps:**
  1. Click the remove button at the end of the product's row.
- **Expected result:** The product disappears, the cart shows as empty, and the cart icon disappears from the top menu.
- **Basis:** Needs confirming
- **Map reference:** K1
- **Notes:** The remove button is an icon with no text or label, which is also worth raising as an accessibility issue (see the plan's questions).

### TC-CRT-04 — Continuing to shop keeps the cart

- **Priority:** Low
- **Type:** Navigation
- **Before you start:** One product in the cart. Viewing the cart.
- **Steps:**
  1. Click **Continue Shopping**.
- **Expected result:** The product catalogue opens, and the cart icon still shows the same number of items.
- **Basis:** Needs confirming
- **Map reference:** K1
