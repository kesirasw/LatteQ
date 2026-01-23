import { test } from '../../fixtures/test';

test('GitHub: search repo + issues filter', async ({ github }) => {
  await github.open();
  await github.search('microsoft playwright');
  await github.openFirstRepoResult();
  await github.goToIssuesAndFilter('is:issue is:open label:bug');
});
