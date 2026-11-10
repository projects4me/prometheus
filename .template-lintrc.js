/* eslint-env node */
'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    // Ember 6 removed the implicit this fallback; keep new violations out.
    // Component invocations without arguments stay as curly calls.
    'no-implicit-this': { allow: ['application-controlbar'] },
  },
};
