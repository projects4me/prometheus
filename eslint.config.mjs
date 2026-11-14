/**
 * ESLint flat config.
 *
 * Existing violations are recorded in eslint-suppressions.json, so `npm run lint:js` (and CI) fails only on new
 * ones. When a recorded violation is fixed, lint fails until `npm run lint:js:prune` drops it from the file, so it stays fixed.
 */
import globals from 'globals';
import js from '@eslint/js';

import ember from 'eslint-plugin-ember/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import qunit from 'eslint-plugin-qunit';
import n from 'eslint-plugin-n';

import babelParser from '@babel/eslint-parser';

const esmParserOptions = {
  ecmaFeatures: { modules: true },
  ecmaVersion: 'latest',
  requireConfigFile: false,
  babelOptions: {
    plugins: [['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]],
  },
};

export default [
  js.configs.recommended,
  ember.configs.base,
  ember.configs.gjs,
  {
    ignores: ['dist/', 'tmp/', 'node_modules/', 'coverage/', 'vendor/', 'public/', 'custom/', 'docs/', '!**/.*'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
    },
  },
  {
    files: ['**/*.{js,gjs}'],
    languageOptions: {
      parserOptions: esmParserOptions,
      globals: {
        ...globals.browser,
        // Loaded as vendor scripts by ember-cli-build.js (app.import).
        Logger: 'readonly',
        Messenger: 'readonly',
        Pace: 'readonly',
        Chart: 'readonly',
        ColorHash: 'readonly',
      },
    },
  },
  {
    // ember-cli-mirage exposes the running server as a global in tests.
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        server: 'writable',
      },
    },
  },
  {
    // plugin:ember/recommended already errors on classic components and classes, observers, jQuery, mixins,
    // actions hashes and component lifecycle hooks; add this.get/get() as well.
    files: ['app/**/*.js', 'tests/**/*.js', 'mirage/**/*.js'],
    rules: {
      'ember/no-get': 'error',
    },
  },
  {
    files: ['tests/**/*-test.{js,gjs}'],
    plugins: {
      qunit,
    },
    rules: {
      ...qunit.configs.recommended.rules,
    },
  },
  /**
   * CJS node files
   */
  {
    files: [
      '**/*.cjs',
      'config/**/*.js',
      'lib/**/*.js',
      'testem.js',
      'ember-cli-build.js',
      '.template-lintrc.js',
      '.prettierrc.js',
    ],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
  },
  /**
   * ESM node files
   */
  {
    files: ['**/*.mjs'],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: esmParserOptions,
      globals: {
        ...globals.node,
      },
    },
  },
  // Last, so formatting is left to Prettier (`npm run format`).
  eslintConfigPrettier,
];
