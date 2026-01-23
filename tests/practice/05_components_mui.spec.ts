import { test } from '../../fixtures/test';

test('MUI: select option via portal', async ({ mui }) => {
  await mui.openSelectDemo();
  await mui.pickSimpleSelect('Ten');
});
