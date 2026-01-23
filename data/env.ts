/**
 * Environment configuration for tests
 * Set these via process.env or create a .env file
 */

export const ENV = {
  // GitHub credentials (optional for auth tests)
  GH_USER: process.env.GH_USER || '',
  GH_PASS: process.env.GH_PASS || '',

  // API endpoints
  BOOKING_URL: 'https://www.booking.com',
  GITHUB_URL: 'https://github.com',
  DATATABLES_URL: 'https://datatables.net/examples/basic_init/zero_configuration.html',
  UITP_URL: 'https://uitestingplayground.com',
  MUI_URL: 'https://mui.com/material-ui/react-select/',
  HIGHCHARTS_URL: 'https://www.highcharts.com/demo',

  // Test data
  TEST_KEYWORDS: {
    booking: 'Melbourne',
    github: 'microsoft playwright',
    datatables: 'London',
  },

  // Timeouts (in ms)
  SHORT_TIMEOUT: 5_000,
  MEDIUM_TIMEOUT: 10_000,
  LONG_TIMEOUT: 30_000,
};
