/* global self */
/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * ember-cli-deprecation-workflow: the deprecations still known in the app, each silenced on purpose.
 *
 * Every deprecation that Ember 5.0 or Ember Data 5.0 removes is fixed. The entries below come from addons
 * and go in their own next major, not in Ember 5.0:
 * - ember-concurrency.deprecate-decorator-task: the `@task` decorator, removed in ember-concurrency 5.0.
 * - ensure-safe-component.string: `ensureSafeComponent` with a component name (AppUi::MilestoneBlock picks
 *   a `milestone-blocks/*` template by status), deprecated by @embroider/util.
 *
 * To work one off: change its handler to `throw`, run the tests, fix the call sites, then delete the entry.
 * Anything not listed here logs as usual.
 */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  throwOnUnhandled: false,
  workflow: [
    { handler: 'silence', matchId: 'ember-concurrency.deprecate-decorator-task' },
    { handler: 'silence', matchId: 'ensure-safe-component.string' }
  ]
};
