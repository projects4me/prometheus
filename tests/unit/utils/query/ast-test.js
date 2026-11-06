/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { add, condition, find, group, isComplete, move, normalize, remove, replace, setConjunction } from 'prometheus/utils/query/ast';

module('Unit | Utility | query | ast', function () {
    test('the factories build frozen nodes with unique ids', function (assert) {
        let high = condition('Issue.priority', ':', 'High');
        let root = group('or', [high]);

        assert.strictEqual(high.kind, 'condition');
        assert.strictEqual(root.kind, 'group');
        assert.strictEqual(root.conjunction, 'OR', 'the conjunction is upper-cased');
        assert.strictEqual(group('XOR').conjunction, 'AND', 'an unknown conjunction is AND');
        assert.notStrictEqual(high.id, root.id);
        assert.ok(high.id && root.id);
        assert.true(Object.isFrozen(root) && Object.isFrozen(root.children) && Object.isFrozen(high));
        assert.strictEqual(condition('a', 'IN', ['x']).value.length, 1);
    });

    test('isComplete checks the value against the arity', function (assert) {
        assert.true(isComplete(condition('Issue.priority', ':', 'High')));
        assert.true(isComplete(condition('Issue.estimate', ':', 0)));
        assert.false(isComplete(condition('Issue.priority', ':', ' ')));
        assert.false(isComplete(condition('Issue.priority', ':', null)));
        assert.false(isComplete(condition('', ':', 'High')), 'a field is needed');
        assert.false(isComplete(condition('Issue.priority', '??', 'High')), 'the operator must be known');
        assert.true(isComplete(condition('Issue.dueDate', 'NULL', null)), 'nullary needs no value');
        assert.true(isComplete(condition('Issue.startDate', 'BETWEEN', ['2026-01-01', '2026-02-01'])));
        assert.false(isComplete(condition('Issue.startDate', 'BETWEEN', ['2026-01-01', ''])));
        assert.false(isComplete(condition('Issue.startDate', 'BETWEEN', '2026-01-01')));
        assert.true(isComplete(condition('Issue.status', 'IN', ['a', 'b'])));
        assert.false(isComplete(condition('Issue.status', 'IN', [])));
        assert.false(isComplete(group('AND', [])), 'a group is not a condition');
    });

    test('add, replace and remove return new trees and keep the old one', function (assert) {
        let a = condition('Issue.a', ':', '1');
        let b = condition('Issue.b', ':', '2');
        let inner = group('OR', []);
        let root = group('AND', [a, inner]);

        let added = add(root, inner.id, b);
        assert.deepEqual(find(added, inner.id).children.map((n) => n.id), [b.id]);
        assert.strictEqual(root.children[1].children.length, 0, 'the input is untouched');
        assert.strictEqual(added.children[0], a, 'unchanged nodes are shared');

        let first = add(root, root.id, b, 0);
        assert.deepEqual(first.children.map((n) => n.id), [b.id, a.id, inner.id], 'an index places the node');
        assert.strictEqual(add(root, a.id, b), root, 'a condition is not a parent');

        let c = condition('Issue.c', ':', '3', a.id);
        let replaced = replace(root, a.id, c);
        assert.strictEqual(replaced.children[0].field, 'Issue.c');
        assert.strictEqual(replaced.id, root.id, 'the parent keeps its id');

        let removed = remove(root, a.id);
        assert.deepEqual(removed.children.map((n) => n.id), [inner.id]);
        assert.strictEqual(remove(root, root.id).children.length, 0, 'removing the root empties the tree');
    });

    test('move moves a node between groups', function (assert) {
        let a = condition('Issue.a', ':', '1');
        let b = condition('Issue.b', ':', '2');
        let inner = group('OR', [b]);
        let root = group('AND', [a, inner]);

        let moved = move(root, a.id, inner.id, 0);
        assert.deepEqual(moved.children.map((n) => n.id), [inner.id]);
        assert.deepEqual(moved.children[0].children.map((n) => n.id), [a.id, b.id]);

        assert.strictEqual(move(root, inner.id, inner.id), root, 'a group cannot move into itself');
        assert.strictEqual(move(root, root.id, inner.id), root, 'the root cannot move');
        assert.strictEqual(move(root, a.id, b.id), root, 'the target must be a group');
        assert.strictEqual(move(root, 'missing', inner.id), root);

        let outer = group('AND', [group('OR', [inner]), a]);
        assert.strictEqual(move(outer, outer.children[0].id, inner.id), outer, 'a group cannot move into its child');
    });

    test('setConjunction changes one group', function (assert) {
        let inner = group('AND', [condition('Issue.a', ':', '1')]);
        let root = group('AND', [inner]);
        let changed = setConjunction(root, inner.id, 'OR');

        assert.strictEqual(changed.children[0].conjunction, 'OR');
        assert.strictEqual(changed.conjunction, 'AND');
        assert.strictEqual(inner.conjunction, 'AND');
    });

    test('normalize merges, unwraps and drops groups', function (assert) {
        let a = condition('Issue.a', ':', '1');
        let b = condition('Issue.b', ':', '2');
        let c = condition('Issue.c', ':', '3');

        let merged = normalize(group('AND', [a, group('AND', [b, c])]));
        assert.deepEqual(merged.children.map((n) => n.id), [a.id, b.id, c.id], 'same conjunction merges');

        let kept = normalize(group('AND', [a, group('OR', [b, c])]));
        assert.strictEqual(kept.children[1].conjunction, 'OR', 'a different conjunction stays nested');

        let unwrapped = normalize(group('AND', [a, group('OR', [b])]));
        assert.deepEqual(unwrapped.children.map((n) => n.id), [a.id, b.id], 'one-child groups unwrap');

        let dropped = normalize(group('AND', [a, group('OR', [group('AND', [])]), b]));
        assert.deepEqual(dropped.children.map((n) => n.id), [a.id, b.id], 'empty groups go');

        let root = group('AND', [group('OR', [b, c])]);
        let lifted = normalize(root);
        assert.strictEqual(lifted.conjunction, 'OR', 'a single child group becomes the root');

        let single = group('OR', [a]);
        let wrapped = normalize(single);
        assert.strictEqual(wrapped.kind, 'group', 'the root stays a group');
        assert.strictEqual(wrapped.id, single.id);
        assert.deepEqual(wrapped.children, [a]);

        let empty = normalize(group('AND', [group('OR', [])]));
        assert.strictEqual(empty.children.length, 0);

        let already = group('AND', [a, group('OR', [b, c])]);
        assert.strictEqual(normalize(already), already, 'a normal tree is returned as it is');
    });
});
