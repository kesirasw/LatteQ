import { test } from '../../fixtures/test';

test('UITP: Dynamic ID + Load Delay', async ({ uitp }) => {
  await uitp.open();

  await uitp.openDynamicId();
  await uitp.clickDynamicButton();

  await uitp.open();
  await uitp.openLoadDelay();
  await uitp.clickAppearingButton();
});
