import { test, expect } from '../../fixtures/test';
import { ToolshopData, ToolshopMessages } from '../../data/toolshop-data';
import type { ToolshopCatalogPage } from '../../pages/ToolshopCatalogPage';
import type { ToolshopProductPage } from '../../pages/ToolshopProductPage';
import type { ToolshopCheckoutPage } from '../../pages/ToolshopCheckoutPage';

// Plan: test-plans/toolshop/test-cases/04-checkout-and-payment.md

const { address } = ToolshopData;

/** Put one product in the cart and open the cart step. */
async function startCheckout(
  catalog: ToolshopCatalogPage,
  product: ToolshopProductPage,
  checkout: ToolshopCheckoutPage,
  productName: string,
) {
  await catalog.open();
  await catalog.openProduct(productName);
  await product.addToCart();
  await checkout.open();
  await checkout.proceed();
}

test.describe('Toolshop: checkout and payment', () => {
  test.beforeEach(async ({ toolshopCatalog, toolshopProduct, toolshopCheckout, toolshopInStockProduct }) => {
    await startCheckout(toolshopCatalog, toolshopProduct, toolshopCheckout, toolshopInStockProduct.name);
  });

  test('TC-CHK-01 Toolshop: signing in during checkout @smoke', async ({ toolshopCheckout, toolshopCustomer }) => {
    await toolshopCheckout.signIn(toolshopCustomer.email, toolshopCustomer.password);

    await expect(toolshopCheckout.alreadyLoggedIn).toContainText(`Hello ${toolshopCustomer.fullName}`);
    await expect(toolshopCheckout.header.userMenu(toolshopCustomer.fullName)).toBeVisible();
  });

  test('TC-CHK-02 Toolshop: guest checkout asks for contact details', async ({ toolshopCheckout, actions, page }) => {
    await actions.safeClick(toolshopCheckout.guestTab);
    await actions.safeClick(toolshopCheckout.guestSubmit);

    for (const message of ['Email is required', 'First name is required', 'Last name is required']) {
      await expect(page.getByText(message, { exact: true })).toBeVisible();
    }
    await expect(toolshopCheckout.postalCode).toBeHidden();
  });

  test.describe('signed in', () => {
    test.beforeEach(async ({ toolshopCheckout, toolshopCustomer }) => {
      await toolshopCheckout.signIn(toolshopCustomer.email, toolshopCustomer.password);
      await toolshopCheckout.proceed();
      await expect(toolshopCheckout.postalCode).toBeVisible();
    });

    test('TC-CHK-03 Toolshop: checkout waits for the required address details @smoke', async ({
      toolshopCheckout: checkout,
      actions,
    }) => {
      for (const field of [checkout.postalCode, checkout.houseNumber, checkout.state]) await field.clear();
      await expect(checkout.proceedButton).toBeDisabled();

      await actions.safeFill(checkout.postalCode, address.postalCode);
      await expect(checkout.proceedButton).toBeDisabled();

      // House number triggers the postcode lookup, which fills State as well
      await actions.safeFill(checkout.houseNumber, address.houseNumber);
      await expect(checkout.state).not.toHaveValue('');
      await expect(checkout.proceedButton).toBeEnabled();

      const lookedUpState = await checkout.state.inputValue();
      await checkout.state.clear();
      await expect(checkout.proceedButton).toBeDisabled();
      await actions.safeFill(checkout.state, lookedUpState);
      await expect(checkout.proceedButton).toBeEnabled();
    });

    test('TC-CHK-04 Toolshop: postcode lookup fills in the street and city', async ({ toolshopCheckout: checkout }) => {
      await checkout.street.clear();
      await checkout.city.clear();

      await checkout.fillAddressByPostcode(address.postalCode, address.houseNumber);

      await expect(checkout.street).not.toHaveValue('');
      await expect(checkout.city).not.toHaveValue('');
    });

    test.describe('at the payment step', () => {
      test.beforeEach(async ({ toolshopCheckout: checkout }) => {
        await checkout.fillAddressByPostcode(address.postalCode, address.houseNumber);
        await checkout.proceed();
        await expect(checkout.paymentMethod).toBeVisible();
      });

      test('TC-CHK-05 Toolshop: each payment method asks for its own details', async ({
        toolshopCheckout: checkout,
        page,
      }) => {
        const fieldsByMethod: Record<string, string[]> = {
          'Bank Transfer': ['Bank Name', 'Account Name', 'Account Number'],
          'Credit Card': ['Credit Card Number', 'Expiration Date', 'CVV', 'Card Holder Name'],
          'Gift Card': ['Gift Card Number', 'Validation Code'],
        };
        for (const [method, fields] of Object.entries(fieldsByMethod)) {
          await checkout.choosePaymentMethod(method);
          for (const field of fields) await expect(page.getByRole('textbox', { name: field })).toBeVisible();
        }

        await checkout.choosePaymentMethod('Buy Now Pay Later');
        const installments = page.getByRole('combobox', { name: 'Monthly Installments' });
        await expect(installments).toBeVisible();
        for (const months of [3, 6, 9, 12]) {
          await expect(installments.getByRole('option', { name: `${months} Monthly Installments` })).toBeAttached();
        }

        await checkout.choosePaymentMethod('Cash on Delivery');
        await expect(page.getByRole('textbox', { name: 'Bank Name' })).toBeHidden();
        await expect(page.getByRole('textbox', { name: 'Credit Card Number' })).toBeHidden();
      });

      test('TC-CHK-06 Toolshop: checking a cash-on-delivery payment @smoke', async ({ toolshopCheckout: checkout }) => {
        await checkout.choosePaymentMethod('Cash on Delivery');
        await checkout.checkPayment();

        await expect(checkout.paymentSuccess).toBeVisible();
        await expect(checkout.confirmButton).toBeVisible();
      });

      test('TC-CHK-07 Toolshop: placing an order @smoke', async ({ toolshopCheckout: checkout, toolshopAccount }) => {
        await checkout.choosePaymentMethod('Cash on Delivery');
        await checkout.checkPayment();
        await checkout.confirm();

        await expect(checkout.orderConfirmation).toBeVisible();
        await expect(checkout.invoiceNumber).toHaveText(/^INV-\d+$/);
        const invoiceNumber = await checkout.invoiceNumber.innerText();
        await expect(checkout.header.cartLink).toBeHidden();

        await toolshopAccount.openInvoices();
        await expect(toolshopAccount.invoiceCell(invoiceNumber)).toBeVisible();
      });

      test('TC-CHK-08 Toolshop: credit card number must be in the right format', async ({
        toolshopCheckout: checkout,
        actions,
        page,
      }) => {
        await checkout.choosePaymentMethod('Credit Card');
        await actions.safeFill(page.getByRole('textbox', { name: 'Credit Card Number' }), '1234');
        await actions.safeFill(page.getByRole('textbox', { name: 'Expiration Date' }), '12/2030');
        await actions.safeFill(page.getByRole('textbox', { name: 'CVV' }), '123');
        await actions.safeFill(page.getByRole('textbox', { name: 'Card Holder Name' }), 'Latte Tester');

        await expect(page.getByText(ToolshopMessages.invalidCardNumber)).toBeVisible();
        await expect(checkout.checkPaymentButton).toBeDisabled();
      });

      test('TC-CHK-09 Toolshop: gift card details are checked', async ({
        toolshopCheckout: checkout,
        actions,
        page,
      }) => {
        await checkout.choosePaymentMethod('Gift Card');
        await actions.safeFill(page.getByRole('textbox', { name: 'Gift Card Number' }), 'ABC123');
        await actions.safeFill(page.getByRole('textbox', { name: 'Validation Code' }), '123');

        await expect(page.getByText(ToolshopMessages.invalidGiftCardNumber)).toBeVisible();
        await expect(page.getByText(ToolshopMessages.invalidGiftCardCode)).toBeVisible();
        await expect(checkout.checkPaymentButton).toBeDisabled();
      });

      test('TC-CHK-10 Toolshop: buy now, pay later needs a number of instalments', async ({
        toolshopCheckout: checkout,
      }) => {
        await checkout.choosePaymentMethod('Buy Now Pay Later');

        await expect(checkout.checkPaymentButton).toBeDisabled();
      });
    });

    test("TC-CHK-11 Toolshop: a state that doesn't match the country is explained", async ({
      toolshopCheckout: checkout,
      actions,
      network,
      page,
    }) => {
      test.fail(
        true,
        'DEF-001 (plan §9.1): the shop refuses the order (422) but shows no message on screen. Remove test.fail once the site explains the error.',
      );
      await checkout.fillAddressByPostcode(address.postalCode, address.houseNumber);
      await checkout.state.clear();
      await actions.safeFill(checkout.state, ToolshopData.mismatchedState);
      await checkout.proceed();
      await checkout.choosePaymentMethod('Cash on Delivery');
      await checkout.checkPayment();

      const refused = network.waitForResponseContains('/invoices', { status: 422 });
      await checkout.confirm();
      await refused;

      await expect(page.getByText(/does not belong to the selected country/)).toBeVisible();
    });

    test('TC-CHK-12 Toolshop: an expired sign-in at the last step is explained', async ({
      toolshopCheckout: checkout,
      network,
      page,
    }) => {
      test.fail(
        true,
        'DEF-002 (plan §9.2): an expired sign-in makes the shop refuse the order (401) with no message on screen. Remove test.fail once the site explains it.',
      );
      await checkout.fillAddressByPostcode(address.postalCode, address.houseNumber);
      await checkout.proceed();
      await checkout.choosePaymentMethod('Cash on Delivery');
      await checkout.checkPayment();

      // Simulate the 300-second token expiring while the customer is on the payment step
      await page.evaluate(() => localStorage.setItem('auth-token', 'expired.session.token'));
      const refused = network.waitForResponseContains('/invoices', { status: 401 });
      await checkout.confirm();
      await refused;

      await expect(page.getByText(/session.*expired|sign in again|log in again/i)).toBeVisible();
    });
  });
});
