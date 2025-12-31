import { fixupConfigRules } from '@eslint/compat';
import prettier from 'eslint-plugin-prettier';
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
    compat.extends('eslint:recommended', 'plugin:import/recommended', 'prettier', 'eslint-config-prettier')
  ),
  {
    files: ['**/*.js', '**/*.mjs'],
    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },

    settings: {
      'import/extensions': ['.js', '.mjs'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs'],
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

      'import/no-named-as-default-member': ['warn'],
      'import/prefer-default-export': ['off'],
      'import/no-import-module-exports': ['warn'],

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          mjs: 'always',
          jsx: 'never',
        },
      ],

      'import/named': ['off'],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^lowdb/'],
        },
      ],

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
];
