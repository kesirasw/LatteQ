import { test, expect } from '../../fixtures/test';

test('MUI: picking an option in a portal-rendered select shows it as the value', async ({ mui }) => {
  await mui.openSelectDemo();
  await mui.pickSimpleSelect('Ten');

  await expect(mui.basicSelect).toHaveText('Ten');
});
