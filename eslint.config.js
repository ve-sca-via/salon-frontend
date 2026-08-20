import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_'
      }],
    },
  },
  {
    // api/ holds the Vercel serverless functions that server-render /blog.
    // They run on Node, not in the browser, and are CommonJS: package.json has
    // no "type": "module", and adding one would change how Vite, PostCSS and
    // Tailwind load their own configs. Their *.test.js files are ESM (vitest
    // transforms them) but still need the Node globals, so both are covered.
    files: ['api/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { sourceType: 'commonjs' },
    },
  },
]
