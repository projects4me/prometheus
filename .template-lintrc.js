'use strict';

/**
 * ember-template-lint config.
 *
 * Existing violations are recorded as todos in .lint-todo, so `npm run lint:hbs` (and CI) fails only on new ones.
 * A lint run removes the todos of fixed violations from .lint-todo; commit that, so they stay fixed. To record
 * existing violations again (e.g. after enabling a rule), run `npx ember-template-lint . --update-todo`.
 */
module.exports = {
  extends: 'recommended',
  ignore: ['dist/**', 'tmp/**', 'coverage/**', 'vendor/**', 'public/**', 'custom/**', 'docs/**'],
  rules: {
    // Octane: use tracked state and actions instead of two-way {{mut}}.
    'no-mut-helper': 'error',
    // Rich text goes through <AppUi::Editor>; only the editor wraps <AppUi::ToastUi>.
    'no-restricted-invocations': [
      'error',
      [{ names: ['app-ui/toast-ui'], message: 'Use <AppUi::Editor> for rich text; only the editor wraps ToastUi.' }],
    ],
  },
  overrides: [
    {
      // The editor wraps ToastUi; ToastUi's own integration test renders it directly.
      files: [
        'app/components/app-ui/editor.hbs',
        'app/components/app-ui/editor/**',
        'app/components/app-ui/toast-ui.hbs',
        'tests/integration/components/toast-ui-test.js',
      ],
      rules: {
        'no-restricted-invocations': 'off',
      },
    },
  ],
};
