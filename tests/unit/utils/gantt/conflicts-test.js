/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isConflict } from 'prometheus/utils/gantt/conflicts';

module('Unit | Utility | gantt/conflicts', function () {
	const blocker = { endDate: '2026-03-10' };
	const open = () => true;
	const done = () => false;

	test('an open blocker conflicts when the blocked issue starts before its end', function (assert) {
		assert.true(isConflict(blocker, { startDate: '2026-03-05' }, open));
	});

	test('an open blocker conflicts when the blocked issue starts on its end day', function (assert) {
		assert.true(isConflict(blocker, { startDate: '2026-03-10T08:00:00' }, open));
	});

	test('no conflict when the blocked issue starts after the blocker ends', function (assert) {
		assert.false(isConflict(blocker, { startDate: '2026-03-11' }, open));
	});

	test('a done blocker never conflicts', function (assert) {
		assert.false(isConflict(blocker, { startDate: '2026-03-05' }, done));
	});

	test('missing dates never conflict', function (assert) {
		assert.false(isConflict({ endDate: null }, { startDate: '2026-03-05' }, open));
		assert.false(isConflict(blocker, {}, open));
	});
});
