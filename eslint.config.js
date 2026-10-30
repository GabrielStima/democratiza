import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'playwright-report',
      'test-results',
      'Claude outputs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['*.config.{js,ts}', 'clean-appledouble.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  { files: ['scripts/**'], rules: { 'no-console': 'off' } },
  {
    // O relógio é injetável: só engine/relogio.ts e os testes podem ler a hora do sistema.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/engine/relogio.ts', 'src/**/*.test.{ts,tsx}', 'src/testes/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Use agora() ou hoje() de engine/relogio.ts em vez de new Date().',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Use agora() de engine/relogio.ts em vez de Date.now().',
        },
      ],
    },
  },
  prettier,
);
