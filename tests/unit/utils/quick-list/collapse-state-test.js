/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import CollapseState from 'prometheus/utils/quick-list/collapse-state';

module('Unit | Utility | quick-list/collapse-state', function () {
	test('groups are expanded by default', function (assert) {
		assert.false(new CollapseState().isCollapsed('status', 'open'));
	});

	test('toggle collapses and expands a key', function (assert) {
		let c = new CollapseState();
		c.toggle('status', 'open');
		assert.true(c.isCollapsed('status', 'open'));
		c.toggle('status', 'open');
		assert.false(c.isCollapsed('status', 'open'));
	});

	test('state is kept per groupBy', function (assert) {
		let c = new CollapseState();
		c.toggle('status', 'open');
		assert.false(c.isCollapsed('type', 'open'));
		c.toggle('type', 'bug');
		assert.true(c.isCollapsed('status', 'open'));
		assert.true(c.isCollapsed('type', 'bug'));
	});

	test('null is a valid key', function (assert) {
		let c = new CollapseState();
		c.toggle('status', null);
		assert.true(c.isCollapsed('status', null));
	});
});
