/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isConflict, conflictingBlockers, blockerName } from 'prometheus/utils/gantt/conflicts';

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

module('Unit | Utility | gantt/conflicts blockers', function () {
	const link = (source) => ({ type: 'blocks', belongsTo: () => ({ id: () => '1', value: () => source }) });
	const lookupOf = (blockers, isOpen = () => true) => ({
		links: blockers.map(link),
		isOpen
	});
	const blocked = { id: '1', startDate: '2026-03-05' };

	test('lists the open late blockers, latest-ending first', function (assert) {
		let early = { id: '2', endDate: '2026-03-06' };
		let late = { id: '3', endDate: '2026-03-09' };
		let before = { id: '4', endDate: '2026-03-01' };
		let result = conflictingBlockers(blocked, lookupOf([early, before, late]));
		assert.deepEqual(result.map((b) => b.id), ['3', '2']);
	});

	test('skips done blockers', function (assert) {
		let result = conflictingBlockers(blocked, lookupOf([{ id: '2', endDate: '2026-03-09' }], () => false));
		assert.deepEqual(result, []);
	});

	test('names a same-project blocker by number and another project by its code', function (assert) {
		assert.strictEqual(blockerName({ projectId: '5', issueNumber: 12 }, 5), '#12');
		assert.strictEqual(blockerName({ projectId: '6', projectShortcode: 'abc' }, 5), 'ABC');
	});
});
