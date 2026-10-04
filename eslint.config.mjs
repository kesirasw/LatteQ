import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', '.auth/', '**/*.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: "Hard waits are forbidden (CLAUDE.md WON'T). Use a web-first assertion or waitForResponse.",
        },
        {
          selector: 'Literal[value=/^(xpath=|\\/\\/)/]',
          message: "XPath selectors are forbidden (CLAUDE.md WON'T). Use getByRole/getByLabel/etc.",
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'warn',
      // Page-object assertXxx() methods count as assertions
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^assert[A-Z]'] }],
      // Conditional skips with a reason are allowed (CLAUDE.md); bare test.skip() is caught by the hook
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      'playwright/valid-title': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: 'Import test/expect from fixtures/test.ts (CLAUDE.md MUST #1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['pages/**/*.ts'],
    plugins: { playwright },
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'warn',
    },
  },
  prettier,
);
