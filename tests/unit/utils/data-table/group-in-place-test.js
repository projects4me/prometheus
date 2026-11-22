/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { groupInPlace } from 'prometheus/utils/data-table/group-in-place';

module('Unit | Utility | data-table/group-in-place', function () {
	const option = { groupKey: (r) => r.group, groupLabel: (k) => k.toUpperCase() };

	test('without a groupKey all rows are one plain section', function (assert) {
		assert.deepEqual(groupInPlace([{ id: 1 }], {}), [{ plain: true, items: [{ id: 1 }] }]);
		assert.deepEqual(groupInPlace(null, option), []);
	});

	test('groups sit where their first row appears and ungrouped rows keep their position', function (assert) {
		let rows = [
			{ id: 1, group: 'a' },
			{ id: 2, group: null },
			{ id: 3, group: '' },
			{ id: 4, group: 'b' },
			{ id: 5, group: 'a' },
		];
		let sections = groupInPlace(rows, option);
		let names = sections.map((s) => `${s.plain ? 'plain' : s.label}:${s.items.map((r) => r.id).join(',')}`);
		assert.deepEqual(names, ['A:1,5', 'plain:2,3', 'B:4']);
		assert.strictEqual(sections[0].count, 2);
	});
});
