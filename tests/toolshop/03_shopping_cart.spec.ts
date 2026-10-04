import { test, expect } from '../../fixtures/test';
import { ToolshopData, ToolshopMessages } from '../../data/toolshop-data';

// Plan: test-plans/toolshop/test-cases/03-shopping-cart.md

const product = ToolshopData.products.combinationPliers;
const money = (amount: number) => `$${amount.toFixed(2)}`;

test.describe('Toolshop: shopping cart', () => {
  let unitPrice = 0;

  test.beforeEach(async ({ toolshopCatalog, toolshopProduct }) => {
    await toolshopCatalog.open();
    await toolshopCatalog.openProduct(product);
    unitPrice = Number(await toolshopProduct.unitPrice.innerText());
  });

  test('TC-CRT-01 Toolshop: cart shows the right line and total prices @smoke', async ({
    toolshopProduct,
    toolshopCheckout,
  }) => {
    await toolshopProduct.setQuantity(2);
    await toolshopProduct.addToCart();
    await toolshopCheckout.open();

    await expect(toolshopCheckout.rowQuantity(product)).toHaveValue('2');
    await expect(toolshopCheckout.cartRow(product)).toContainText(money(unitPrice));
    await expect(toolshopCheckout.linePrices.first()).toHaveText(money(unitPrice * 2));
    await expect(toolshopCheckout.cartTotal).toHaveText(money(unitPrice * 2));
  });

  test('TC-CRT-02 Toolshop: changing a quantity updates the totals', async ({ toolshopProduct, toolshopCheckout }) => {
    await toolshopProduct.addToCart();
    await toolshopCheckout.open();

    await toolshopCheckout.setRowQuantity(product, 3);

    await expect(toolshopCheckout.linePrices.first()).toHaveText(money(unitPrice * 3));
    await expect(toolshopCheckout.cartTotal).toHaveText(money(unitPrice * 3));
    await expect(toolshopCheckout.header.cartQuantity).toHaveText('3');
  });

  test('TC-CRT-03 Toolshop: removing an item', async ({ toolshopProduct, toolshopCheckout }) => {
    await toolshopProduct.addToCart();
    await toolshopCheckout.open();

    await toolshopCheckout.removeItem(product);

    await expect(toolshopCheckout.header.alert).toContainText(ToolshopMessages.productDeleted);
    await expect(toolshopCheckout.emptyCartMessage).toBeVisible();
    await expect(toolshopCheckout.header.cartLink).toBeHidden();
  });

  test('TC-CRT-04 Toolshop: continuing to shop keeps the cart', async ({
    toolshopProduct,
    toolshopCheckout,
    toolshopCatalog,
    actions,
  }) => {
    await toolshopProduct.addToCart();
    await toolshopCheckout.open();

    await actions.safeClick(toolshopCheckout.continueShoppingButton);

    await expect(toolshopCatalog.productNameItems.first()).toBeVisible();
    await expect(toolshopCatalog.header.cartQuantity).toHaveText('1');
  });
});
