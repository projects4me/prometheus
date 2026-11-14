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
    // Component invocations without arguments stay as curly calls.
    'no-implicit-this': { allow: ['application-controlbar'] },
    // Octane: use tracked state and actions instead of two-way {{mut}}.
    'no-mut-helper': 'error',
  },
};
