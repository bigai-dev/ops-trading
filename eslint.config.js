import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next', 'out']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.next,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Hooks and shadcn/ui style helpers that intentionally live next to their components
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: ['metadata', 'useToast', 'useI18n', 'buttonVariants', 'badgeVariants', 'tabsListVariants'],
      }],
    },
  },
  {
    files: ['next.config.mjs', 'postcss.config.mjs', 'tests/**/*.js'],
    languageOptions: { globals: globals.node },
  },
])
