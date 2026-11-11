/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import { Test, Adapter, QUnitAdapter } from 'ember-testing';

/**
 * Ember 4.1 sets `Test.Adapter` only when something reads the `Ember.Test` global, and
 * `@ember/test/adapter` returns `Test.Adapter`. ember-qunit 8+ is a v2 addon that imports
 * `@ember/test/adapter` and never reads the global, so it gets `undefined`. Set the adapter
 * classes the way Ember's lazy getter does. Import this module before `ember-qunit`.
 * Remove it once Ember is 4.x with the fix (or 5+).
 *
 * @module tests/helpers/ember-testing-adapter
 */
Test.Adapter = Test.Adapter || Adapter;
Test.QUnitAdapter = Test.QUnitAdapter || QUnitAdapter;
