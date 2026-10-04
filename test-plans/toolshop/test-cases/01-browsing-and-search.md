# Browsing and search — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** The product catalogue on the home page: the product list, searching, sorting, filtering and moving between pages.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-CAT-01 | Home page shows a page of products | High | Seen during exploration |
| TC-CAT-02 | Searching shows only matching products | High | Seen during exploration |
| TC-CAT-03 | Clearing the search brings back all products | Medium | Needs confirming |
| TC-CAT-04 | Sorting by price, lowest first | Medium | Seen during exploration |
| TC-CAT-05 | Other sort options order the list correctly | Low | Needs confirming |
| TC-CAT-06 | Filtering by a product category | Medium | Seen during exploration |
| TC-CAT-07 | Filtering by brand | Low | Needs confirming |
| TC-CAT-08 | Showing only eco-friendly products | Low | Needs confirming |
| TC-CAT-09 | Limiting the price range | Low | Needs confirming |
| TC-CAT-10 | Moving to the next page of products | Medium | Needs confirming |

---

### TC-CAT-01 — Home page shows a page of products

- **Priority:** High
- **Type:** Functional
- **Before you start:** Nothing. Any visitor.
- **Steps:**
  1. Open the Toolshop home page.
  2. Wait until the product list has loaded.
- **Expected result:** Nine products are shown, each with a name and a price. Below them are page buttons **1** to **5**, plus **Previous** and **Next**.
- **Basis:** Seen during exploration
- **Map reference:** C1

### TC-CAT-02 — Searching shows only matching products

- **Priority:** High
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Type **pliers** in the **Search** box.
  2. Click **Search**.
- **Expected result:** A heading reads **Searched for: pliers**, and every product shown has "Pliers" in its name (for example Combination Pliers, Long Nose Pliers, Slip Joint Pliers).
- **Basis:** Seen during exploration
- **Map reference:** C2

### TC-CAT-03 — Clearing the search brings back all products

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** A search for **pliers** is showing (TC-CAT-02).
- **Steps:**
  1. Click the **X** next to the search box.
- **Expected result:** The "Searched for" heading disappears, and the full product list returns, including products that aren't pliers.
- **Basis:** Needs confirming
- **Map reference:** C2

### TC-CAT-04 — Sorting by price, lowest first

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. In the **Sort** list, choose **Price (Low - High)**.
- **Expected result:** Each product costs the same as or more than the one before it. During exploration the list started with Washers ($3.55), then $3.95, then $4.65.
- **Basis:** Seen during exploration
- **Map reference:** C3
- **Notes:** Check the order, not the exact prices. Prices on the demo can change.

### TC-CAT-05 — Other sort options order the list correctly

- **Priority:** Low
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Choose **Price (High - Low)**, then **Name (A - Z)**, then **Name (Z - A)**, checking the list after each.
- **Expected result:** The list follows the chosen order each time.
- **Basis:** Needs confirming
- **Map reference:** C1

### TC-CAT-06 — Filtering by a product category

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Under **By category**, tick **Hammer**.
- **Expected result:** Only hammers are shown (for example Claw Hammer, Thor Hammer, Sledgehammer).
- **Basis:** Seen during exploration
- **Map reference:** C4

### TC-CAT-07 — Filtering by brand

- **Priority:** Low
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Under **By brand**, tick **ForgeFlex Tools**.
  2. Open two of the products shown.
- **Expected result:** The list changes, and each product opened belongs to ForgeFlex Tools.
- **Basis:** Needs confirming
- **Map reference:** C1

### TC-CAT-08 — Showing only eco-friendly products

- **Priority:** Low
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Tick **Show only eco-friendly products**.
- **Expected result:** Only products with a good eco rating are shown.
- **Basis:** Needs confirming
- **Map reference:** C1

### TC-CAT-09 — Limiting the price range

- **Priority:** Low
- **Type:** Functional
- **Before you start:** On the home page.
- **Steps:**
  1. Drag the upper end of the **Price Range** slider down to a lower amount.
- **Expected result:** No product shown costs more than the new upper limit.
- **Basis:** Needs confirming
- **Map reference:** C1

### TC-CAT-10 — Moving to the next page of products

- **Priority:** Medium
- **Type:** Navigation
- **Before you start:** On the home page.
- **Steps:**
  1. Note the names of the products on page 1.
  2. Click page **2**.
- **Expected result:** A different set of products is shown, and page 2 is marked as the current page.
- **Basis:** Needs confirming
- **Map reference:** C1
