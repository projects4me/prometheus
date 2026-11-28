/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isActiveRoute } from 'prometheus/utils/navigation/active-route';

module('Unit | Utility | navigation/active-route', function () {
	test('a route matches itself and its descendants', function (assert) {
		assert.true(isActiveRoute('app.project', 'app.project'));
		assert.true(isActiveRoute('app.project', 'app.project.page'));
		assert.false(isActiveRoute('app.project', 'app.projects'));
	});

	test('the app route matches only exactly', function (assert) {
		assert.true(isActiveRoute('app', 'app.index'));
		assert.false(isActiveRoute('app', 'app.project'));
	});

	test('nothing matches without a route or a current route', function (assert) {
		assert.false(isActiveRoute(undefined, 'app.project'));
		assert.false(isActiveRoute('app.project', null));
	});
});
