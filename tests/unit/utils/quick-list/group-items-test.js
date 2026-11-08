/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { groupItems } from 'prometheus/utils/quick-list/group-items';

module('Unit | Utility | quick-list/group-items', function () {
    const option = {
        key: 'status',
        groupKey: (r) => r.status,
        groupLabel: (k) => k.toUpperCase()
    };

    test('it returns no groups for empty input', function (assert) {
        assert.deepEqual(groupItems([], option), []);
        assert.deepEqual(groupItems(null, option), []);
    });

    test('it groups in first-seen order with counts and labels', function (assert) {
        const a = { id: 1, status: 'b' }, b = { id: 2, status: 'a' }, c = { id: 3, status: 'b' };
        const groups = groupItems([a, b, c], option);
        assert.deepEqual(groups.map((g) => g.key), ['b', 'a']);
        assert.deepEqual(groups.map((g) => g.label), ['B', 'A']);
        assert.deepEqual(groups.map((g) => g.count), [2, 1]);
        assert.deepEqual(groups[0].items, [a, c]);
    });

    test('null, undefined and empty keys share one group with a null label', function (assert) {
        const groups = groupItems([{ status: null }, { status: 'a' }, {}, { status: '' }], option);
        assert.deepEqual(groups.map((g) => g.label), [null, 'A']);
        assert.strictEqual(groups[0].key, null);
        assert.strictEqual(groups[0].count, 3);
    });

    test('a missing option returns no groups', function (assert) {
        assert.deepEqual(groupItems([{ a: 1 }], undefined), []);
    });
});
