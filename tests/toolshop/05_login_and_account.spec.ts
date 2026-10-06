import { test, expect } from '../../fixtures/test';
import { ToolshopData, ToolshopMessages, newToolshopCustomer } from '../../data/toolshop-data';

// Plan: test-plans/toolshop/test-cases/05-login-and-account.md

test.describe('Toolshop: login and account', () => {
  test('TC-AUT-01 Toolshop: signing in as a customer @smoke', async ({
    toolshopAuth,
    toolshopAccount,
    toolshopCustomer,
  }) => {
    await toolshopAuth.signIn(toolshopCustomer.email, toolshopCustomer.password);

    await expect(toolshopAccount.heading).toBeVisible();
    for (const link of ['Favorites', 'Profile', 'Invoices', 'Messages']) {
      await expect(toolshopAccount.accountLink(link)).toBeVisible();
    }
    await expect(toolshopAccount.header.userMenu(toolshopCustomer.fullName)).toBeVisible();
  });

  test('TC-AUT-02 Toolshop: sign-in needs an email address', async ({ toolshopAuth, page }) => {
    await toolshopAuth.openLogin();
    await toolshopAuth.submitLogin('', 'any-password-1');

    await expect(page.getByText(ToolshopMessages.emailRequired)).toBeVisible();
    await expect(toolshopAuth.loginHeading).toBeVisible();
  });

  test('TC-AUT-03 Toolshop: signing in with a wrong password', async ({ toolshopAuth, toolshopCustomer, page }) => {
    await toolshopAuth.openLogin();
    await toolshopAuth.submitLogin(toolshopCustomer.email, 'Wrong-password-1');

    await expect(page.getByText(ToolshopMessages.invalidLogin)).toBeVisible();
    await expect(toolshopAuth.accountHeading).toBeHidden();
  });

  test('TC-AUT-04 Toolshop: registration explains the password rules', async ({ toolshopAuth, page }) => {
    await toolshopAuth.openRegister();

    for (const rule of [
      'Be at least 8 characters long',
      'Contain both uppercase and lowercase letters',
      'Include at least one number',
      'Have at least one special symbol (e.g., @, #, $, etc.)',
    ]) {
      await expect(page.getByText(rule, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('Password strength:')).toBeVisible();
  });

  test('TC-AUT-05 Toolshop: registering a new customer', async ({ toolshopAuth, toolshopAccount, page }) => {
    const customer = newToolshopCustomer();
    await toolshopAuth.openRegister();
    await toolshopAuth.fillRegistration(customer, ToolshopData.address.country);
    await toolshopAuth.submitRegistration();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await toolshopAuth.submitLogin(customer.email, customer.password);
    await expect(toolshopAccount.heading).toBeVisible();
  });

  test('TC-AUT-06 Toolshop: a weak password is refused', async ({ toolshopAuth, page }) => {
    const customer = { ...newToolshopCustomer(), password: 'abc' };
    await toolshopAuth.openRegister();
    await toolshopAuth.fillRegistration(customer, ToolshopData.address.country);
    await toolshopAuth.submitRegistration();

    await expect(page.getByText(ToolshopMessages.passwordTooShort)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test('TC-AUT-07 Toolshop: asking for a new password', async ({ toolshopAuth, toolshopCustomer, network, page }) => {
    test.fail(
      true,
      'DEF-003 (plan §9.3): the confirmation shows the untranslated key "page.forgot-password.confirm". Remove test.fail once a real message is shown.',
    );
    const answered = network.waitForResponseContains('/users/forgot-password', { status: 200 });
    await toolshopAuth.requestNewPassword(toolshopCustomer.email);
    await answered;

    // Expected: a readable confirmation. Wait for the confirmation box, then check it isn't the raw translation key.
    // The box has no role or label (MAP R2), so it's located by its .alert class.
    const confirmation = page.locator('.alert').first();
    await expect(confirmation).toBeVisible();
    await expect(confirmation).not.toHaveText(ToolshopMessages.forgotPasswordRawKey);
  });

  test('TC-AUT-08 Toolshop: signing out', async ({ toolshopAuth, toolshopAccount, toolshopCustomer, page }) => {
    await toolshopAuth.signIn(toolshopCustomer.email, toolshopCustomer.password);
    await toolshopAccount.header.signOut(toolshopCustomer.fullName);

    await expect(toolshopAccount.header.signInLink).toBeVisible();
    await toolshopAccount.open();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
