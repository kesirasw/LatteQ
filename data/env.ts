/**
 * Environment configuration for tests
 * Set these via process.env or create a .env file
 */

export const ENV = {
  // GitHub credentials (optional for auth tests)
  GH_USER: process.env.GH_USER || '',
  GH_PASS: process.env.GH_PASS || '',

  // Toolshop demo customer (published demo accounts are listed in ui-context/toolshop/MAP.md)
  TOOLSHOP_EMAIL: process.env.TOOLSHOP_EMAIL || '',
  TOOLSHOP_PASSWORD: process.env.TOOLSHOP_PASSWORD || '',

  // Site URLs (override via process.env to point at another environment)
  BOOKING_URL: process.env.BOOKING_URL || 'https://www.booking.com/',
  GITHUB_URL: process.env.GITHUB_URL || 'https://github.com/',
  DATATABLES_URL:
    process.env.DATATABLES_URL || 'https://datatables.net/examples/core/basic_init/zero_configuration.html',
  UITP_URL: process.env.UITP_URL || 'https://uitestingplayground.com/',
  MUI_URL: process.env.MUI_URL || 'https://mui.com/material-ui/react-select/',
  HIGHCHARTS_URL: process.env.HIGHCHARTS_URL || 'https://www.highcharts.com/demo',
  TOOLSHOP_URL: process.env.TOOLSHOP_URL || 'https://practicesoftwaretesting.com/',
  TOOLSHOP_API_URL: process.env.TOOLSHOP_API_URL || 'https://api.practicesoftwaretesting.com',

  // Test data
  TEST_KEYWORDS: {
    booking: 'Melbourne',
    github: 'playwright',
    githubRepo: 'microsoft/playwright',
    // Label verified on the repo's labels page (highest open-issue count, so least likely to empty out)
    githubIssueFilter: 'is:issue state:open label:P3-collecting-feedback',
    datatables: 'London',
  },

  // Timeouts (in ms)
  SHORT_TIMEOUT: 5_000,
  MEDIUM_TIMEOUT: 10_000,
  LONG_TIMEOUT: 30_000,
};
