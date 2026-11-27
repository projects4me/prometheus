/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isConflict, conflictingBlockers, blockerName } from 'prometheus/utils/gantt/conflicts';
import { schedule } from 'prometheus/utils/gantt/schedule';

const issueOf = (id, startDate, endDate, estimateHours = null) => ({ id, startDate, endDate, estimateHours });
const planOf = (issues, links) => schedule(issues, links.map(([sourceId, targetId]) => ({ sourceId, targetId })));

module('Unit | Utility | gantt/conflicts', function () {
	const open = () => true;
	const done = () => false;

	test('an open blocker conflicts when it pushes the blocked issue past its end date', function (assert) {
		let blocker = issueOf('1', '2026-03-02', '2026-03-10');
		let blocked = issueOf('2', '2026-03-05', '2026-03-06', 4);
		let plan = planOf([blocker, blocked], [['1', '2']]);
		assert.true(plan.get('2').pushed, 'the schedule pushes it');
		assert.true(isConflict(blocker, blocked, open, plan));
	});

	test('a same-day chain that fits its window is not a conflict', function (assert) {
		let blocker = issueOf('1', '2026-03-05', '2026-03-05', 3);
		let blocked = issueOf('2', '2026-03-05', '2026-03-05', 3);
		let plan = planOf([blocker, blocked], [['1', '2']]);
		assert.false(plan.get('2').pushed);
		assert.false(isConflict(blocker, blocked, open, plan));
	});

	test('a same-day chain that overflows its window is a conflict', function (assert) {
		let blocker = issueOf('1', '2026-03-05', '2026-03-05', 6);
		let blocked = issueOf('2', '2026-03-05', '2026-03-05', 6);
		let plan = planOf([blocker, blocked], [['1', '2']]);
		assert.true(isConflict(blocker, blocked, open, plan));
	});

	test('a blocker that ends before the blocked issue starts is not a conflict', function (assert) {
		let blocker = issueOf('1', '2026-03-02', '2026-03-04');
		let blocked = issueOf('2', '2026-03-05', '2026-03-06');
		let plan = planOf([blocker, blocked], [['1', '2']]);
		assert.false(isConflict(blocker, blocked, open, plan));
	});

	test('a done blocker never conflicts', function (assert) {
		let blocker = issueOf('1', '2026-03-02', '2026-03-10');
		let blocked = issueOf('2', '2026-03-05', '2026-03-06', 4);
		let plan = planOf([blocker, blocked], [['1', '2']]);
		assert.false(isConflict(blocker, blocked, done, plan));
	});

	test('missing dates or no schedule never conflict', function (assert) {
		let blocker = issueOf('1', '2026-03-02', '2026-03-10');
		assert.false(isConflict(blocker, issueOf('2', null, null), open, planOf([blocker], [])));
		assert.false(isConflict(blocker, issueOf('2', '2026-03-05', '2026-03-06'), open));
	});

	test('a blocker off the chart counts by its end date', function (assert) {
		let blocker = issueOf('9', '2026-03-02', '2026-03-10');
		let blocked = issueOf('2', '2026-03-05', '2026-03-06', 4);
		let plan = planOf([blocked], []);
		assert.false(isConflict(blocker, blocked, open, plan), 'not pushed without it');
		plan = planOf([blocked], []);
		plan.get('2').pushed = true;
		assert.true(isConflict(blocker, blocked, open, plan));
	});
});

module('Unit | Utility | gantt/conflicts blockers', function () {
	const link = (source) => ({ type: 'blocks', belongsTo: () => ({ id: () => '1', value: () => source }) });
	const lookupOf = (blockers, isOpen = () => true) => ({
		links: blockers.map(link),
		isOpen
	});
	const blocked = { id: '1', startDate: '2026-03-05', endDate: '2026-03-06', estimateHours: 4 };
	const planFor = (blockers) => planOf([blocked, ...blockers], blockers.map((b) => [b.id, '1']));

	test('lists the open late blockers, latest-ending first', function (assert) {
		let early = issueOf('2', '2026-03-02', '2026-03-06');
		let late = issueOf('3', '2026-03-02', '2026-03-09');
		let before = issueOf('4', '2026-03-01', '2026-03-01');
		let all = [early, before, late];
		let result = conflictingBlockers(blocked, lookupOf(all), planFor(all));
		assert.deepEqual(result.map((b) => b.id), ['3', '2']);
	});

	test('skips done blockers', function (assert) {
		let late = issueOf('2', '2026-03-02', '2026-03-09');
		let result = conflictingBlockers(blocked, lookupOf([late], () => false), planFor([late]));
		assert.deepEqual(result, []);
	});

	test('names a same-project blocker by number and another project by its code', function (assert) {
		assert.strictEqual(blockerName({ projectId: '5', issueNumber: 12 }, 5), '#12');
		assert.strictEqual(blockerName({ projectId: '6', projectShortcode: 'abc' }, 5), 'ABC');
	});
});
