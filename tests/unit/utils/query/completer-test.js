/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { complete } from 'prometheus/utils/query/completer';
import { forType } from 'prometheus/utils/query/operators';
import { issueQuerySchema } from 'prometheus/tests/helpers/query-schema';

const schema = issueQuerySchema();

/** Complete text where `|` marks the cursor. */
function at(marked) {
    let cursor = marked.indexOf('|');
    let text = marked.replace('|', '');

    return { text, ...complete(text, cursor, schema) };
}

const inserts = (result) => result.suggestions.map((s) => s.insert);

module('Unit | Utility | query | completer', function () {
    test('a field prefix gives the field first, then the free-text item', function (assert) {
        let result = at('prio|');

        assert.strictEqual(result.context, 'field');
        assert.strictEqual(result.suggestions[0].kind, 'field');
        assert.strictEqual(result.suggestions[0].detail, 'Issue.priority');
        assert.strictEqual(result.suggestions[result.suggestions.length - 1].kind, 'text');
        assert.deepEqual(result.suggestions[result.suggestions.length - 1].params, { field: 'Subject', word: 'prio' });
        assert.deepEqual([result.replaceStart, result.replaceEnd], [0, 4]);
    });

    test('nothing typed lists the fields in schema order', function (assert) {
        let result = at('|');

        assert.strictEqual(result.context, 'field');
        assert.deepEqual(
            result.suggestions.map((s) => s.detail),
            schema.fields.map((f) => f.id)
        );
    });

    test('ranking: exact, label prefix, alias prefix, word start, substring', function (assert) {
        assert.strictEqual(at('type|').suggestions[0].detail, 'issuetype.name', 'exact alias');
        assert.strictEqual(at('date|').suggestions[0].detail, 'Issue.startDate', 'word start in the label');
        assert.strictEqual(at('ssig|').suggestions[0].detail, 'assignedTo.name', 'substring');
        assert.strictEqual(at('mile|').suggestions[0].detail, 'issuemilestone.name');
    });

    test('after a field only its type operators are offered', function (assert) {
        let result = at('priority |');

        assert.strictEqual(result.context, 'operator');
        assert.deepEqual(inserts(result), forType('enum').map((op) => op.key));
        assert.deepEqual([result.replaceStart, result.replaceEnd], [9, 9]);
    });

    test('a typed operator word is ranked', function (assert) {
        let result = at('start betw|');

        assert.strictEqual(result.context, 'operator');
        assert.strictEqual(result.suggestions[0].insert, 'BETWEEN');
    });

    test('after an operator the values are offered', function (assert) {
        let result = at('priority = h|');

        assert.strictEqual(result.context, 'value');
        assert.deepEqual(inserts(result), ['High']);
        assert.deepEqual([result.replaceStart, result.replaceEnd], [11, 12]);
        assert.deepEqual(inserts(at('priority = |')), ['Low', 'Medium', 'High', 'Critical'], 'enum order');
        assert.deepEqual(inserts(at('assignee: |')), ['"Agent Odysseus"', '"Hammad Hassan"', '"Rana Nouman"'], 'users alphabetical, quoted');
    });

    test('values are offered inside quotes and replace the quote', function (assert) {
        let result = at('assignee:"ham|"');

        assert.deepEqual(inserts(result), ['"Hammad Hassan"']);
        assert.deepEqual([result.replaceStart, result.replaceEnd], [9, 14]);
    });

    test('a range end gives date values', function (assert) {
        let result = at('start between 2026-05-01 and |');

        assert.strictEqual(result.context, 'value');
        assert.deepEqual(inserts(result), ['today']);
        assert.deepEqual(inserts(at('start > |')), ['today']);
    });

    test('a text field has no value suggestions', function (assert) {
        assert.deepEqual(at('subject : |').suggestions, []);
    });

    test('a complete condition offers the conjunctions and the closing bracket', function (assert) {
        let result = at('(type:bug |');

        assert.strictEqual(result.context, 'connector');
        assert.deepEqual(inserts(result), ['AND', 'OR', ')']);
        assert.deepEqual(inserts(at('type:bug |')), ['AND', 'OR'], 'no bracket is open');
    });

    test('a group keeps the conjunction it uses', function (assert) {
        assert.deepEqual(inserts(at('(type:bug OR type:story |')), ['OR', ')']);
        assert.deepEqual(inserts(at('status:new milestone:v1 |')), ['AND'], 'an implied AND counts');
        assert.deepEqual(inserts(at('(type:bug) OR (status:new |')), ['AND', 'OR', ')'], 'a new group starts free');
        assert.deepEqual(inserts(at('(type:bug AND (status:new OR status:done) |')), ['AND', ')'], 'the inner group is one condition');
    });

    test('a range awaits its AND', function (assert) {
        assert.deepEqual(inserts(at('start between 2026-05-01 |')), ['AND']);
    });

    test('words after a condition start a new one', function (assert) {
        let result = at('status:new pri|');

        assert.strictEqual(result.context, 'field');
        assert.strictEqual(result.suggestions[0].detail, 'Issue.priority');
        assert.strictEqual(at('status:new an|').context, 'connector');
    });

    test('a cursor in the middle replaces the whole word', function (assert) {
        let result = at('status:new pri|ority = high');

        assert.strictEqual(result.context, 'field');
        assert.deepEqual([result.replaceStart, result.replaceEnd], [11, 19]);

        let value = at('priority = h|igh and status:new');

        assert.deepEqual(inserts(value), ['High']);
        assert.deepEqual([value.replaceStart, value.replaceEnd], [11, 15]);
    });

    test('at most eight suggestions', function (assert) {
        assert.ok(at('start |').suggestions.length <= 8);
    });
});
