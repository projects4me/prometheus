/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { KINDS, lex } from 'prometheus/utils/query/lexer';
import { issueQuerySchema } from 'prometheus/tests/helpers/query-schema';

const kinds = (text, schema) => lex(text, schema).map((token) => `${token.kind}:${token.value}`);

module('Unit | Utility | query | lexer', function () {
    test('the token kinds are stable', function (assert) {
        assert.deepEqual(Object.values(KINDS), ['field', 'operator', 'value', 'quoted', 'comma', 'keyword', 'bracket', 'word']);
    });

    test('tokens carry their source text and offsets', function (assert) {
        let text = 'prio = hi status != done';

        for (let token of lex(text)) {
            assert.strictEqual(text.slice(token.start, token.end), token.text, `${token.kind} ${token.text}`);
        }

        assert.deepEqual(kinds(text), ['field:prio', 'operator::', 'value:hi', 'field:status', 'operator:!:', 'value:done']);
        assert.deepEqual(kinds('priority:high'), ['field:priority', 'operator::', 'value:high'], 'no spaces are needed');
    });

    test('operators are read as their registry key', function (assert) {
        assert.deepEqual(kinds('a<=1 b>:2 c~x d!=y'), ['field:a', 'operator:<:', 'value:1', 'field:b', 'operator:>:', 'value:2', 'field:c', 'operator:CONTAINS', 'value:x', 'field:d', 'operator:!:', 'value:y']);
        assert.deepEqual(kinds('assignee not in rana'), ['field:assignee', 'operator:NOT IN', 'value:rana']);
        assert.deepEqual(kinds('Issue.subject !CONTAINS x'), ['field:Issue.subject', 'operator:!CONTAINS', 'value:x']);
        assert.deepEqual(kinds('Issue.dueDate null and Issue.subject !EMPTY'), ['field:Issue.dueDate', 'operator:NULL', 'keyword:AND', 'field:Issue.subject', 'operator:!EMPTY']);
    });

    test('quotes, commas and keywords', function (assert) {
        assert.deepEqual(kinds(`assignee in "Rana Nouman", 'a and b or c'`), ['field:assignee', 'operator:IN', 'quoted:Rana Nouman', 'comma:,', 'quoted:a and b or c']);
        assert.deepEqual(kinds('a:1 And b:2 oR c:3'), ['field:a', 'operator::', 'value:1', 'keyword:AND', 'field:b', 'operator::', 'value:2', 'keyword:OR', 'field:c', 'operator::', 'value:3']);
        assert.deepEqual(kinds('start between 05/01/2026 and today'), ['field:start', 'operator:BETWEEN', 'value:05/01/2026', 'keyword:AND', 'value:today']);
        assert.deepEqual(kinds(`don't panic`), ["word:don't", 'word:panic'], 'a quote inside a word is part of it');

        let [open] = lex(`'not closed`);

        assert.strictEqual(open.kind, KINDS.quoted);
        assert.strictEqual(open.value, 'not closed');
        assert.true(open.unterminated);
    });

    test('free-text words', function (assert) {
        let schema = issueQuerySchema();

        assert.deepEqual(kinds('time zone', schema), ['word:time', 'word:zone']);
        assert.deepEqual(kinds('crash in login', schema), ['word:crash', 'word:in', 'word:login'], 'a word operator only follows a known field');
        assert.deepEqual(kinds('crash in login'), ['field:crash', 'operator:IN', 'value:login'], 'without a schema any word can be a field');
        assert.deepEqual(kinds('crash ~ login', schema), ['field:crash', 'operator:CONTAINS', 'value:login'], 'a symbol operator always follows a field');
    });

    test('a condition that fills its brackets reads its value to the closing bracket', function (assert) {
        assert.deepEqual(kinds('(assignedTo.name : Hammad Hassan)'), ['bracket:(', 'field:assignedTo.name', 'operator::', 'value:Hammad Hassan', 'bracket:)']);
        assert.deepEqual(kinds('((Issue.milestoneId : 5 ))'), ['bracket:(', 'bracket:(', 'field:Issue.milestoneId', 'operator::', 'value:5', 'bracket:)', 'bracket:)']);
        assert.deepEqual(kinds("(assignedTo.name CONTAINS 'Rana Nouman','Hammad Hassan')"), ['bracket:(', 'field:assignedTo.name', 'operator:CONTAINS', 'quoted:Rana Nouman', 'comma:,', 'quoted:Hammad Hassan', 'bracket:)']);
        assert.deepEqual(kinds('(Issue.status CONTAINS in progress,done)'), ['bracket:(', 'field:Issue.status', 'operator:CONTAINS', 'value:in progress', 'comma:,', 'value:done', 'bracket:)']);
        assert.deepEqual(kinds('(Issue.startDate BETWEEN 2026-01-01 AND 2026-02-01)'), ['bracket:(', 'field:Issue.startDate', 'operator:BETWEEN', 'value:2026-01-01', 'keyword:AND', 'value:2026-02-01', 'bracket:)']);
        assert.deepEqual(kinds('(type:bug OR type:story)'), ['bracket:(', 'field:type', 'operator::', 'value:bug', 'keyword:OR', 'field:type', 'operator::', 'value:story', 'bracket:)'], 'brackets with more than one condition are typed text');
    });
});
