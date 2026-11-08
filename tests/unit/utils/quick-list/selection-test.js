/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import Selection from 'prometheus/utils/quick-list/selection';

module('Unit | Utility | quick-list/selection', function () {
	const items = [{ id: 1 }, { id: 2 }, { id: '3' }];

	test('it starts empty', function (assert) {
		let s = new Selection();
		assert.strictEqual(s.count, 0);
		assert.strictEqual(s.state(items), 'none');
	});

	test('toggle adds and removes ids as strings and notifies', function (assert) {
		let calls = [];
		let s = new Selection((ids) => calls.push(ids));
		s.toggle(1);
		assert.deepEqual(s.ids, ['1']);
		assert.true(s.has(1));
		s.toggle('1');
		assert.deepEqual(s.ids, []);
		assert.deepEqual(calls, [['1'], []]);
	});

	test('state is none, some or all', function (assert) {
		let s = new Selection();
		s.toggle(2);
		assert.strictEqual(s.state(items), 'some');
		s.toggle(1);
		s.toggle(3);
		assert.strictEqual(s.state(items), 'all');
	});

	test('toggleAll selects everything, then clears', function (assert) {
		let s = new Selection();
		s.toggleAll(items);
		assert.deepEqual(s.ids, ['1', '2', '3']);
		s.toggleAll(items);
		assert.deepEqual(s.ids, []);
	});

	test('toggleAll from some selects all', function (assert) {
		let s = new Selection();
		s.toggle(1);
		s.toggleAll(items);
		assert.strictEqual(s.count, 3);
	});

	test('clear empties and notifies', function (assert) {
		let calls = [];
		let s = new Selection((ids) => calls.push(ids));
		s.toggle(1);
		s.clear();
		assert.strictEqual(s.count, 0);
		assert.deepEqual(calls.at(-1), []);
	});
});
