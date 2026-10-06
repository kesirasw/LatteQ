import { test, expect } from '../../fixtures/test';

test.describe('UITP', () => {
  test.beforeEach(async ({ uitp }) => {
    await uitp.open();
  });

  test('UITP: button with a dynamic id is clickable by its role and name', async ({ uitp }) => {
    await uitp.openDynamicId();
    await uitp.clickDynamicButton();

    await expect(uitp.dynamicIdButton).toBeFocused();
  });

  test('UITP: waits for a slow page before clicking the delayed button', async ({ uitp }) => {
    await uitp.openLoadDelay();
    await uitp.clickAppearingButton();

    await expect(uitp.delayedButton).toBeFocused();
  });
});
