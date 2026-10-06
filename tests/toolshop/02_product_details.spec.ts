import { test, expect } from '../../fixtures/test';
import { ToolshopData, ToolshopMessages } from '../../data/toolshop-data';

// Plan: test-plans/toolshop/test-cases/02-product-details.md

test.describe('Toolshop: product details', () => {
  // Quantity and cart buttons are disabled on a sold-out product, so use one in stock (KB §16)
  test.beforeEach(async ({ toolshopCatalog, toolshopInStockProduct }) => {
    await toolshopCatalog.open();
    await toolshopCatalog.openProduct(toolshopInStockProduct.name);
  });

  test('TC-PRD-01 Toolshop: opening a product from the catalogue @smoke', async ({
    toolshopProduct,
    toolshopInStockProduct,
  }) => {
    await expect(toolshopProduct.title).toHaveText(toolshopInStockProduct.name);
    await expect(toolshopProduct.unitPrice).toHaveText(/^\d+\.\d{2}$/);
    await expect(toolshopProduct.quantity).toHaveValue('1');
    await expect(toolshopProduct.addToCartButton).toBeVisible();
    await expect(toolshopProduct.addToFavouritesButton).toBeVisible();
    await expect(toolshopProduct.compareButton).toBeVisible();
    await expect(toolshopProduct.relatedProducts).toBeVisible();
  });

  test("TC-PRD-02 Toolshop: quantity can't go below 1 or above 99", async ({ toolshopProduct, actions }) => {
    await actions.safeClick(toolshopProduct.decreaseQuantity);
    await expect(toolshopProduct.quantity).toHaveValue('1');

    await toolshopProduct.setQuantity(99);
    await actions.safeClick(toolshopProduct.increaseQuantity);
    await expect(toolshopProduct.quantity).toHaveValue('99');
  });

  test('TC-PRD-03 Toolshop: adding to the cart updates the cart icon @smoke', async ({ toolshopProduct }) => {
    await toolshopProduct.setQuantity(2);
    await toolshopProduct.addToCart();

    await expect(toolshopProduct.header.alert).toContainText(ToolshopMessages.productAdded);
    await expect(toolshopProduct.header.cartLink).toBeVisible();
    await expect(toolshopProduct.header.cartQuantity).toHaveText('2');
  });

  test('TC-PRD-04 Toolshop: adding to favourites when not signed in', async ({ toolshopProduct }) => {
    await toolshopProduct.addToFavourites();

    await expect(toolshopProduct.header.alert).toContainText(ToolshopMessages.favouriteUnauthorized);
  });
});

test.describe('Toolshop: related products', () => {
  // Related products depend on the product, so this one stays on Combination Pliers; viewing needs no stock
  test.beforeEach(async ({ toolshopCatalog }) => {
    await toolshopCatalog.open();
    await toolshopCatalog.openProduct(ToolshopData.products.combinationPliers);
  });

  test('TC-PRD-05 Toolshop: opening a related product', async ({ toolshopProduct }) => {
    await toolshopProduct.openRelatedProduct(ToolshopData.products.pliers);

    await expect(toolshopProduct.title).toHaveText(ToolshopData.products.pliers);
  });
});
