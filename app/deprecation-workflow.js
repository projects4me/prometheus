/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

/**
 * ember-cli-deprecation-workflow: the deprecations still known in the app, each silenced on purpose.
 * app/app.js imports this file first, so the handler is in place before anything else runs.
 *
 * Every deprecation that Ember 7.0 or Ember Data 6.0 removes is fixed, and no entry is silenced any more.
 *
 * To work one off: change its handler to `throw`, run the tests, fix the call sites, then delete the entry.
 * Anything not listed here logs as usual.
 */
setupDeprecationWorkflow({
  throwOnUnhandled: false,
  workflow: []
});
