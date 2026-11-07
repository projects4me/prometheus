/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { condition, group } from 'prometheus/utils/query/ast';
import { serialize } from 'prometheus/utils/query/serializer';

const query = (tree) => serialize(tree).query;

module('Unit | Utility | query | serializer', function () {
    test('the example from the issue', function (assert) {
        let tree = group('AND', [
            condition('Issue.priority', ':', 'High'),
            group('OR', [condition('issuetype.name', ':', 'Bug'), condition('issuetype.name', ':', 'Story')]),
        ]);

        assert.deepEqual(serialize(tree), {
            query: '((Issue.priority : High) AND ((issuetype.name : Bug) OR (issuetype.name : Story)))',
            errors: [],
        });
    });

    test('every group and condition is in brackets', function (assert) {
        assert.strictEqual(query(group('AND', [condition('Issue.projectId', ':', 'p1')])), '((Issue.projectId : p1))');
        assert.strictEqual(query(condition('Issue.projectId', ':', 'p1')), '((Issue.projectId : p1))', 'a bare condition is wrapped');
        assert.strictEqual(
            query(group('AND', [condition('Issue.priority', ':', 'High'), condition('Issue.status', '!:', 'done')])),
            '((Issue.priority : High) AND (Issue.status !: done))'
        );
    });

    test('nested groups with the same conjunction merge', function (assert) {
        let tree = group('AND', [condition('Issue.a', ':', '1'), group('AND', [condition('Issue.b', ':', '2'), group('OR', [condition('Issue.c', ':', '3')])])]);

        assert.strictEqual(query(tree), '((Issue.a : 1) AND (Issue.b : 2) AND (Issue.c : 3))');
    });

    test('incomplete conditions are left out and an empty tree is empty', function (assert) {
        let tree = group('AND', [condition('Issue.a', ':', '1'), condition('Issue.b', ':', ''), group('OR', [condition('Issue.c', 'BETWEEN', ['1'])])]);

        assert.deepEqual(serialize(tree), { query: '((Issue.a : 1))', errors: [] });
        assert.deepEqual(serialize(group('AND', [])), { query: '', errors: [] });
        assert.deepEqual(serialize(group('AND', [condition('Issue.a', ':', null)])), { query: '', errors: [] });
        assert.deepEqual(serialize(null), { query: '', errors: [] }, 'it never throws');
        assert.deepEqual(serialize({}), { query: '', errors: [] });
    });

    test('IN and NOT IN', function (assert) {
        assert.strictEqual(query(group('AND', [condition('Issue.status', 'IN', ['new', 'done'])])), "((Issue.status CONTAINS 'new','done'))");
        assert.strictEqual(query(group('AND', [condition('Issue.status', 'NOT IN', ['new', 'in review'])])), "((Issue.status !CONTAINS 'new','in review'))");
        assert.strictEqual(query(group('AND', [condition('Issue.status', 'IN', ['new'])])), '((Issue.status : new))', 'a one-value IN is :');
        assert.strictEqual(query(group('AND', [condition('Issue.status', 'NOT IN', ['in review'])])), "((Issue.status !: 'in review'))", 'a one-value NOT IN is !:');
    });

    test('ranges, nullary operators, spaces and quoting', function (assert) {
        assert.strictEqual(query(group('AND', [condition('Issue.startDate', 'BETWEEN', ['2026-01-01', '2026-02-01'])])), '((Issue.startDate BETWEEN 2026-01-01 AND 2026-02-01))');
        assert.strictEqual(query(group('AND', [condition('Issue.startDate', '!BETWEEN', ['1', '5'])])), '((Issue.startDate !BETWEEN 1 AND 5))');
        assert.strictEqual(query(group('AND', [condition('Issue.dueDate', 'NULL', null)])), '((Issue.dueDate NULL))');
        assert.strictEqual(query(group('AND', [condition('Issue.subject', '!EMPTY', null)])), '((Issue.subject !EMPTY))');
        assert.strictEqual(query(group('AND', [condition('Issue.subject', 'CONTAINS', ' login page ')])), "((Issue.subject CONTAINS 'login page'))");
        assert.strictEqual(query(group('AND', [condition('Issue.estimate', '>:', 3)])), '((Issue.estimate >: 3))');
    });

    test('it refuses values Gaia cannot read yet', function (assert) {
        let cases = [
            ['a(b', 'reservedCharacter', { character: '(', value: 'a(b' }],
            ['a)b', 'reservedCharacter', { character: ')', value: 'a)b' }],
            ["'quoted'", 'reservedApostrophe', { value: "'quoted'" }],
            ["it's'", 'reservedApostrophe', { value: "it's'" }],
            ['NULL', 'reservedWord', { word: 'NULL', value: 'NULL' }],
            ['NOT EMPTY', 'reservedWord', { word: 'EMPTY', value: 'NOT EMPTY' }],
        ];

        for (let [value, code, params] of cases) {
            let bad = condition('Issue.subject', 'CONTAINS', value);
            let result = serialize(group('AND', [condition('Issue.a', ':', '1'), bad]));

            assert.deepEqual(result.errors, [{ code, params, nodeId: bad.id }], `${value} is refused`);
            assert.strictEqual(result.query, '((Issue.a : 1))', `${value} is left out`);
        }

        assert.strictEqual(query(group('AND', [condition('Issue.subject', 'CONTAINS', "O'Brien")])), "((Issue.subject CONTAINS O'Brien))", 'an inner apostrophe is written');
        for (let value of ["Rana's board", "a','b", "a,'b", "\"O'Brien\"", "a,\"b'c", "O'Brien,"]) {
            let unreadable = condition('Issue.subject', 'CONTAINS', value);
            assert.deepEqual(serialize(group('AND', [unreadable])).errors, [{ code: 'reservedApostrophe', params: { value }, nodeId: unreadable.id }], `${value} cannot be read back, so it is refused`);
        }
        let apostropheList = condition('assignedTo.name', 'IN', ["O'Brien", 'rana']);
        assert.deepEqual(serialize(group('AND', [apostropheList])).errors, [{ code: 'reservedApostrophe', params: { value: "O'Brien" }, nodeId: apostropheList.id }], 'an apostrophe in a list is refused');
        let apostropheRange = condition('Issue.startDate', 'BETWEEN', ["1'2", '3']);
        assert.deepEqual(serialize(group('AND', [apostropheRange])).errors, [{ code: 'reservedApostrophe', params: { value: "1'2" }, nodeId: apostropheRange.id }], 'an apostrophe in a range bound is refused');

        let list = condition('Issue.status', 'IN', ['ok', 'EMPTY']);
        assert.strictEqual(serialize(group('AND', [list])).errors[0].nodeId, list.id, 'list values are checked');

        let range = condition('Issue.startDate', 'BETWEEN', ['1', '(2']);
        assert.strictEqual(serialize(group('AND', [range])).errors[0].code, 'reservedCharacter', 'range bounds are checked');

        let andBound = condition('Issue.startDate', 'BETWEEN', ['1 AND 2', '3']);
        assert.deepEqual(serialize(group('AND', [andBound])).errors, [{ code: 'reservedWord', params: { word: 'AND', value: '1 AND 2' }, nodeId: andBound.id }], 'a range bound cannot contain AND');
        let andEnd = condition('Issue.startDate', 'BETWEEN', ['x AND', 'y']);
        assert.deepEqual(serialize(group('AND', [andEnd])).errors, [{ code: 'reservedWord', params: { word: 'AND', value: 'x AND' }, nodeId: andEnd.id }], 'a lower bound cannot end in AND');
        assert.strictEqual(query(group('AND', [condition('Issue.startDate', 'BETWEEN', ['x', 'AND y'])])), '((Issue.startDate BETWEEN x AND AND y))', 'an upper bound may start with AND');
        assert.deepEqual(serialize(group('AND', [condition('Issue.subject', 'CONTAINS', 'this AND that')])).errors, [], 'AND is fine outside a range');

        let badField = condition('Issue.a) OR (b', ':', '1');
        let fieldResult = serialize(group('AND', [condition('Issue.a', ':', '1'), badField]));
        assert.deepEqual(fieldResult.errors, [{ code: 'invalidField', params: { field: 'Issue.a) OR (b' }, nodeId: badField.id }], 'fields are checked');
        assert.strictEqual(fieldResult.query, '((Issue.a : 1))', 'a bad field is left out');

        assert.deepEqual(serialize(group('AND', [condition('Issue.subject', 'CONTAINS', 'null or empty')])).errors, [], 'lowercase words are fine');
    });
});
