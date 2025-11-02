import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

// TODO: Complete reading through the migration guide:
// https://eslint.org/docs/latest/use/configure/migration-guide#linter-options

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/dist',
      '**/.eslintrc.json',
      '**/node_modules',
      '**/node_modules/',
      '**/webpack/',
      '**/target/',
      '**/build/',
      '**/node/',
      '**/jest.conf.js',
      '**/eslint.config.*',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:import/recommended',
      'plugin:jsx-a11y/recommended',
      // Unfortunately eslint-config-airbnb is not compatible with the latest major version of eslint (9).
      // 'airbnb',
      // 'airbnb/hooks',
      'prettier',
      'eslint-config-prettier'
    )
  ),
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react: fixupPluginRules(react),
      prettier,
      'react-refresh': reactRefresh,
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        google: 'readonly',
      },
      ecmaVersion: 6,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },

      'import/extensions': ['.js', '.jsx'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        alias: {
          // Allow ESLint to recognize Vite imports and path aliases.
          map: [
            ['@', './src'],
            ['', './public'],
          ],
          extensions: ['.js', '.jsx'],
        },
      },
    },

    rules: {
      semi: ['error', 'always'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'global-require': ['warn'],
      'guard-for-in': ['error'],
      radix: ['error'],
      eqeqeq: ['error', 'always'],
      'prefer-const': ['warn'],
      'object-shorthand': [
        'error',
        'always',
        {
          avoidExplicitReturnArrows: true,
        },
      ],

      'default-case': ['error'],
      complexity: ['warn', 40],
      'dot-notation': ['off'],

      'no-use-before-define': [
        'error',
        {
          variables: false,
        },
      ],

      'no-nested-ternary': ['off'],
      'no-console': ['off'],

      'no-param-reassign': [
        'warn',
        {
          ignorePropertyModificationsFor: ['draft'],
        },
      ],

      'no-return-assign': ['error', 'except-parens'],
      'no-plusplus': ['off'],
      'no-unused-vars': ['warn'],

      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],

      'no-shadow': ['warn'],
      'no-labels': ['error'],
      'no-caller': ['error'],
      'no-bitwise': ['error'],
      'no-new-wrappers': ['error'],
      'no-eval': ['error'],
      'no-new': ['error'],
      'no-var': ['error'],
      'no-invalid-this': ['warn'],

      'react/jsx-filename-extension': [
        'warn',
        {
          extensions: ['.js', '.jsx'],
        },
      ],
      'react/react-in-jsx-scope': ['off'],
      'react/prop-types': ['off'],
      'react/require-default-props': ['off'],
      'react/jsx-boolean-value': ['off'],
      'react/jsx-props-no-spreading': ['off'],
      'react/jsx-key': ['error'],
      'react/function-component-definition': ['off'],
      'react/no-array-index-key': ['warn'],
      'react/no-unescaped-entities': ['warn'],
      'react-hooks/rules-of-hooks': ['error'],
      'react-hooks/exhaustive-deps': ['error'],
      'react-refresh/only-export-components': ['warn'],
      'import/no-named-as-default-member': ['warn'],
      'import/prefer-default-export': ['off'],
      'import/no-import-module-exports': ['warn'],

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
        },
      ],

      'import/named': ['off'],
      'import/no-unresolved': ['error'],

      'import/no-extraneous-dependencies': [
        'warn',
        {
          devDependencies: [
            'test/**',
            '__tests__/**',
            '__mocks__/**',
            '**/*.spec.*',
            '**/*.test.*',
            '**/*.stories.*',
            '**/.storybook/**/*.*',
            'vite.config.js',
          ],

          peerDependencies: true,
        },
      ],
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'import/no-unresolved': 'off',
    },
  },
];
