/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import Selection from 'prometheus/utils/state/selection';

module('Unit | Utility | state/selection', function () {
	const page1 = [{ id: 1 }, { id: 2 }];
	const page2 = [{ id: 3 }, { id: 4 }];

	test('it starts empty or with the given ids, kept as strings', function (assert) {
		assert.strictEqual(new Selection().count, 0);
		let selection = new Selection([1, '2']);
		assert.deepEqual(selection.ids, ['1', '2']);
		assert.true(selection.has(1));
		assert.true(selection.has('2'));
		assert.false(selection.has(3));
	});

	test('toggle selects and unselects an id', function (assert) {
		let selection = new Selection();
		selection.toggle(5);
		assert.true(selection.has('5'));
		assert.strictEqual(selection.count, 1);
		selection.toggle('5');
		assert.false(selection.has(5));
		assert.strictEqual(selection.count, 0);
	});

	test('set selects or unselects many ids and clear empties it', function (assert) {
		let selection = new Selection();
		selection.set([1, 2, 3], true);
		selection.set([2], false);
		assert.deepEqual(selection.ids, ['1', '3']);
		selection.set([1], true);
		assert.strictEqual(
			selection.count,
			2,
			'selecting twice does not count twice',
		);
		selection.clear();
		assert.deepEqual(selection.ids, []);
	});

	test('stateFor and countIn work on the given rows only', function (assert) {
		let selection = new Selection();
		assert.strictEqual(selection.stateFor(page1), 'none');
		assert.strictEqual(selection.stateFor([]), 'none');
		selection.set([1], true);
		assert.strictEqual(selection.stateFor(page1), 'some');
		assert.strictEqual(selection.countIn(page1), 1);
		selection.set([2, 3], true);
		assert.strictEqual(selection.stateFor(page1), 'all');
		assert.strictEqual(selection.stateFor(page2), 'some');
		assert.strictEqual(selection.countIn(page2), 1);
		assert.strictEqual(selection.count, 3, 'the count spans pages');
	});
});
