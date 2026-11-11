/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
/* global define */
import { getRootElement } from '@ember/test-helpers';

/**
 * ember-basic-dropdown 3 (pulled in by ember-power-select 4) loads
 * `@ember/test-helpers/dom/get-root-element` at runtime to find where to render dropdowns in tests.
 * @ember/test-helpers 3+ is a v2 addon and no longer ships that deep module, so define it with the
 * public `getRootElement`. Remove it once ember-power-select / ember-basic-dropdown are upgraded.
 *
 * @module tests/helpers/test-helpers-legacy-paths
 */
define('@ember/test-helpers/dom/get-root-element', ['exports'], function (exports) {
  exports.default = getRootElement;
});
