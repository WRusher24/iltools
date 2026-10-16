import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/no-unescaped-entities': 'off',
      // Reading localStorage/URL after mount (consent, calculator state, disclaimer acknowledgement) is hydration-safe by design:
      // server HTML must equal the first client render, so these values can only be applied in an effect.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  { files: ['scripts/content-qa.mjs', 'scripts/seo-lint.mjs'], rules: { '@typescript-eslint/no-unused-vars': 'warn' } }, // Agent 2–5 scripts, kept untouched
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'tmp/**', 'untitled-project/**', 'next-env.d.ts', 'drizzle/**', 'scripts/_probe.ts', 'postcss.config.mjs']),
]);
