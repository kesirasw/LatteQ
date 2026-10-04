import { test, expect } from '../../fixtures/test';
import { ENV } from '../../data/env';

test('GitHub: search a repo and filter its issues by label', async ({ github, page }) => {
  const { github: term, githubRepo, githubIssueFilter } = ENV.TEST_KEYWORDS;

  await test.step('Given the user searches GitHub for a repository', async () => {
    await github.open();
    await github.search(term);
    await expect(github.results.getByRole('link', { name: githubRepo, exact: true })).toBeVisible();
  });

  await test.step('When they open it and filter issues by label', async () => {
    await github.openRepoResult(githubRepo);
    await github.goToIssuesAndFilter(githubIssueFilter);
  });

  await test.step('Then the URL carries the filter and matching issues are listed', async () => {
    await expect(page).toHaveURL((url) => url.searchParams.get('q') === githubIssueFilter);
    await expect(github.issues.first()).toBeVisible();
  });
});
