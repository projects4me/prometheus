/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isGroup } from 'prometheus/utils/query/ast';
import { ERRORS, parse } from 'prometheus/utils/query/parse';
import { createSchema } from 'prometheus/utils/query/schema';
import { serialize } from 'prometheus/utils/query/serializer';
import { issueQuerySchema } from 'prometheus/tests/helpers/query-schema';

const schema = issueQuerySchema();
const today = new Date(2026, 10, 7);
const read = (text) => parse(text, schema, { today });
const query = (text) => serialize(read(text).tree).query;

/**
 * The tree without its node ids, which differ on every parse.
 */
function shape(node) {
    if (isGroup(node)) {
        return { conjunction: node.conjunction, children: node.children.map(shape) };
    }

    return { field: node.field, operator: node.operator, value: node.value };
}

/**
 * The errors as `code start-end`.
 */
function errorsOf(text) {
    return read(text).errors.map((error) => `${error.code} ${error.start}-${error.end}`);
}

const PROJECT = 'b0f4f1c4-1e16-4c5c-9f6e-2a2b3a4c5d6e';
const MILESTONE = '6a1f0d2e-8f3b-4f6a-9a6b-0c1d2e3f4a5b';
const HEADER_SEARCH = 'login';

const ROUND_TRIPS = {
    'board.js l.58 milestones': `((Milestone.projectId : ${PROJECT}) AND ((Milestone.status : in_progress) OR (Milestone.status : planned)))`,
    'board.js l.71 backlog': `(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${PROJECT}))`,
    'board.js l.77 backlog and search': `((((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${PROJECT}))) AND ((Issue.priority : High))`,
    'board.js l.83 statuses': `(Issuestatus.projectId : ${PROJECT})`,
    'board.js l.90 milestone issues': `((Issue.milestoneId : ${MILESTONE} ) AND (Issue.projectId : ${PROJECT}))`,
    'board.js l.92 milestone issues and search': `(((Issue.milestoneId : ${MILESTONE} ) AND (Issue.projectId : ${PROJECT}))) AND ((assignedTo.name : Hammad Hassan))`,
    'board.js l.140 system statuses': '(Issuestatus.system : 1)',
    'board.js l.161 saved searches': `(Savedsearch.relatedTo : issue) AND (Savedsearch.projectId : ${PROJECT})`,
    'board.js l.166 public saved searches': `(Savedsearch.relatedTo : issue) AND (Savedsearch.projectId : ${PROJECT}) AND (Savedsearch.public : 1)`,
    'gantt.js l.59 milestones': `((Milestone.projectId : ${PROJECT}) AND ((Milestone.status : in_progress) OR (Milestone.status : planned)))`,
    'gantt.js l.76 milestone issues': `((Issue.milestoneId : ${MILESTONE}) AND (Issue.projectId : ${PROJECT}))`,
    'gantt.js l.78 milestone issues and search': `(((Issue.milestoneId : ${MILESTONE}) AND (Issue.projectId : ${PROJECT}))) AND ((issuetype.name : Bug))`,
    'application-header.js search': `((Issue.issueNumber CONTAINS ${HEADER_SEARCH}) OR (Issue.subject CONTAINS ${HEADER_SEARCH}) OR (Issue.description CONTAINS ${HEADER_SEARCH}))`,
    'application-header.js search with spaces': '((Issue.issueNumber CONTAINS login page) OR (Issue.subject CONTAINS login page) OR (Issue.description CONTAINS login page))',
    'saved search equal and not_equal on strings': '((Issue.subject : login page) AND (Issue.status !: done) AND (assignedTo.name : Rana Nouman))',
    'saved search contains': '((Issue.subject CONTAINS crash) AND (Issue.subject !CONTAINS mobile))',
    'saved search in and not_in': '((Issue.status CONTAINS new,in_progress) AND (issuetype.name !CONTAINS Bug,Task))',
    'saved search date comparisons': '((Issue.startDate > 2026-01-01) AND (Issue.startDate <: 2026-12-31) AND (Issue.startDate !: 2026-06-01))',
    'saved search between': '((Issue.startDate BETWEEN 2026-01-01 AND 2026-03-31) OR (Issue.startDate !BETWEEN 2026-06-01 AND 2026-06-30))',
    'saved search nested groups': '((Issue.priority : High) AND ((Issue.status : new) OR ((Issue.status : in_review) AND (Issue.subject NULL))))',
    'saved search empty and null': '((Issue.subject EMPTY) OR (Issue.subject !EMPTY) OR (Issue.startDate !NULL))',
    'saved search starts and ends': '((Issue.subject STARTS Fix) AND (Issue.subject !ENDS wip))',
    'header search with lowercase and': '((Issue.subject CONTAINS rock and roll) OR (Issue.description CONTAINS rock and roll))',
    'header search with lowercase or': '((Issue.subject CONTAINS this or that) AND (Issue.status : new))',
    'contains with a comma in the text': '((Issue.subject CONTAINS hello,world) AND (Issue.subject !CONTAINS a,b))',
    'header search with a symbol': '((Issue.subject CONTAINS error: timeout) OR (Issue.description CONTAINS a != b))',
    'header search with uppercase conjunctions': '((Issue.subject CONTAINS rock AND roll) OR (Issue.subject CONTAINS this OR that))',
    'apostrophe inside a value': "((Issue.subject CONTAINS O'Brien))",
    'header search with a comma and a space': '((Issue.subject CONTAINS hello, world))',
};

module('Unit | Utility | query | parse', function () {
    test('an excluded field is refused and nothing is applied', function (assert) {
        let schema = createSchema({
            module: 'Issue',
            textField: 'Issue.subject',
            fields: [{ id: 'Issue.subject', label: 'Subject', type: 'text' }],
            excluded: [{ id: 'issuemilestone.name', aliases: ['milestone'], label: 'Milestone', type: 'enum', reason: 'Use the milestone tabs.' }],
        });
        let { tree, errors } = parse('milestone: Sprint', schema);

        assert.deepEqual(
            errors.map((e) => e.code),
            [ERRORS.excludedField]
        );
        assert.deepEqual(errors[0].params, { field: 'Milestone', reason: 'Use the milestone tabs.' });
        assert.strictEqual(tree.children.length, 0, 'nothing applied');
        assert.strictEqual(parse('(issuemilestone.name : Sprint)', schema).errors[0].code, ERRORS.excludedField, 'a Gaia query too');
        assert.deepEqual(
            parse('milestone:', schema).errors.map((e) => e.code),
            [ERRORS.excludedField],
            'a missing value does not add a second error'
        );
    });

    test('loose input serializes exactly', function (assert) {
        // The serializer brackets the root group too, so one condition is in double brackets.
        assert.strictEqual(query('priority:high'), '((Issue.priority : High))');
        assert.strictEqual(query('prio = hi status != done'), '((Issue.priority : High) AND (Issue.status !: done))');
        assert.strictEqual(query('assignee in rana, hammad'), "((assignedTo.name CONTAINS 'Rana Nouman','Hammad Hassan'))");
        assert.strictEqual(query('timezone'), '((Issue.subject CONTAINS timezone))');
        assert.strictEqual(query('start between 05/01/2026 and 2026-08-31'), '((Issue.startDate BETWEEN 2026-05-01 AND 2026-08-31))');
        assert.strictEqual(query('(type:bug OR type:story) milestone:v0.1.1'), '(((issuetype.name : Bug) OR (issuetype.name : Story)) AND (issuemilestone.name : v0.1.1))');
        assert.strictEqual(query('description ~ crash'), '((Issue.description CONTAINS crash))');
    });

    test('Gaia values keep lowercase conjunctions and unquoted commas', function (assert) {
        assert.strictEqual(query('(Issue.subject CONTAINS rock and roll)'), "((Issue.subject CONTAINS 'rock and roll'))");
        assert.strictEqual(query('(Issue.subject CONTAINS this or that)'), "((Issue.subject CONTAINS 'this or that'))");
        assert.strictEqual(query('(priority:high and status:new)'), '((Issue.priority : High) AND (Issue.status : new))', 'a lowercase and between conditions');
        assert.strictEqual(query('(priority in high and status in new)'), '((Issue.priority : High) AND (Issue.status : new))', 'a lowercase and before a word operator');
        assert.strictEqual(query('(Issue.subject CONTAINS hello,world)'), '((Issue.subject CONTAINS hello,world))');
        assert.strictEqual(query("(Issue.subject CONTAINS 'a','b')"), "((Issue.subject CONTAINS 'a','b'))", 'quoted values stay a list');
        assert.strictEqual(query('subject contains a, b'), "((Issue.subject CONTAINS 'a','b'))", 'a typed list stays a list');
        assert.strictEqual(query('(Issue.status CONTAINS new,in_progress)'), "((Issue.status CONTAINS 'new','in_progress'))", 'an enum list stays a list');
    });

    test('a Gaia condition value runs to its closing bracket', function (assert) {
        let symbol = read('(Issue.subject CONTAINS error: timeout)');

        assert.deepEqual(symbol.errors, []);
        assert.deepEqual(shape(symbol.tree), { conjunction: 'AND', children: [{ field: 'Issue.subject', operator: 'CONTAINS', value: 'error: timeout' }] });
        assert.strictEqual(query('(Issue.subject CONTAINS rock AND roll)'), "((Issue.subject CONTAINS 'rock AND roll'))");
        assert.strictEqual(query('(Issue.subject CONTAINS hello, world)'), "((Issue.subject CONTAINS 'hello, world'))");
        assert.strictEqual(query("(Issue.status CONTAINS 'new', 'done')"), "((Issue.status CONTAINS 'new','done'))", 'a quoted list stays a list');
        assert.strictEqual(query('(Issue.startDate BETWEEN 2026-01-01 AND 2026-03-31)'), '((Issue.startDate BETWEEN 2026-01-01 AND 2026-03-31))', 'a range still splits');
        assert.strictEqual(query('(subject contains pri in x and roll)'), "((Issue.subject CONTAINS 'pri in x and roll'))", 'a field before the conjunction is value text');
    });

    test('the tree it reads', function (assert) {
        let { tree, errors } = read('prio = hi status != done');

        assert.deepEqual(errors, []);
        assert.deepEqual(shape(tree), {
            conjunction: 'AND',
            children: [
                { field: 'Issue.priority', operator: ':', value: 'High' },
                { field: 'Issue.status', operator: '!:', value: 'done' },
            ],
        });
        assert.deepEqual(shape(read('').tree), { conjunction: 'AND', children: [] }, 'empty text is an empty group');
        assert.deepEqual(shape(read('   ').tree), { conjunction: 'AND', children: [] });
    });

    test('conjunctions, brackets and free text', function (assert) {
        assert.strictEqual(query('status:new AND type:bug'), '((Issue.status : new) AND (issuetype.name : Bug))');
        assert.strictEqual(query('status:new Or type:bug'), '((Issue.status : new) OR (issuetype.name : Bug))');
        assert.strictEqual(query('((((status:new))))'), '((Issue.status : new))', 'redundant brackets are allowed');
        assert.strictEqual(query('status:new (type:bug or type:task)'), '((Issue.status : new) AND ((issuetype.name : Bug) OR (issuetype.name : Task)))');
        assert.strictEqual(query('login page crash status:new'), "((Issue.subject CONTAINS 'login page crash') AND (Issue.status : new))", 'consecutive words are one phrase');
        assert.strictEqual(query(`"time zone" offset`), "((Issue.subject CONTAINS 'time zone offset'))");
        assert.strictEqual(query('crash in login'), "((Issue.subject CONTAINS 'crash in login'))", 'a word operator after a free word is free text');
        assert.strictEqual(query(`subject:"a or b"`), "((Issue.subject : 'a or b'))", 'quoted text may hold and/or');
    });

    test('operators and values bind through the schema', function (assert) {
        assert.strictEqual(query('status in new, done'), "((Issue.status CONTAINS 'new','done'))");
        assert.strictEqual(query('status in done'), '((Issue.status : done))', 'a one-value IN is :');
        assert.strictEqual(query('assignee not in rana'), "((assignedTo.name !: 'Rana Nouman'))");
        assert.strictEqual(query('type contains bug'), '((issuetype.name : Bug))', 'CONTAINS on an enum is IN');
        assert.strictEqual(query('status:"in progress"'), '((Issue.status : in_progress))', 'a value can be its label');
        assert.strictEqual(query('status:In_Progress'), '((Issue.status : in_progress))', 'without case');
        assert.strictEqual(query('start >= today'), '((Issue.startDate >: 2026-11-07))');
        assert.strictEqual(query('start < 1/2/2026'), '((Issue.startDate < 2026-01-02))');
        assert.strictEqual(query('Issue.startDate NULL'), '((Issue.startDate NULL))');
        assert.strictEqual(query('subject empty'), '((Issue.subject EMPTY))');
        assert.strictEqual(query('subject:"don\'t"'), "((Issue.subject : don't))", 'an inner apostrophe is written');
        assert.strictEqual(query('subject:"\'quoted\'"'), '', 'a value the serializer refuses is left out there, not here');
        assert.deepEqual(shape(read(`subject:"don't"`).tree).children, [{ field: 'Issue.subject', operator: ':', value: "don't" }]);
    });

    test('status:new or type:bug milestone:v0.1.1 is mixed at the implied AND', function (assert) {
        let text = 'status:new or type:bug milestone:v0.1.1';
        let { tree, errors } = read(text);

        assert.deepEqual(errors, [{ code: ERRORS.mixedConjunction, params: { conjunction: 'AND' }, start: 22, end: 23 }]);
        assert.strictEqual(text.slice(22, 23), ' ', 'the implied AND sits between the conditions');
        assert.deepEqual(shape(tree), { conjunction: 'AND', children: [] }, 'a mixed group is never read');
    });

    test('each error has its code, params and position', function (assert) {
        let at = (text, expected, message) => {
            let { errors } = read(text);

            assert.strictEqual(errors.length, 1, `${text}: one error`);
            assert.deepEqual(errors[0], expected, message || text);
        };

        at('priority', { code: ERRORS.missingOperator, params: { field: 'Priority' }, start: 0, end: 8 });
        at('status:new priority', { code: ERRORS.missingOperator, params: { field: 'Priority' }, start: 11, end: 19 });
        at('priority:', { code: ERRORS.missingValue, params: { field: 'Priority', operator: ':' }, start: 8, end: 9 });
        at('(priority =)', { code: ERRORS.missingValue, params: { field: 'Priority', operator: '=' }, start: 10, end: 11 });
        at('status in new,', { code: ERRORS.missingValue, params: { field: 'Status', operator: ',' }, start: 13, end: 14 });
        at('status:new and type:bug or type:task', { code: ERRORS.mixedConjunction, params: { conjunction: 'OR' }, start: 24, end: 26 });
        at('and status:new', { code: ERRORS.misplacedConjunction, params: { conjunction: 'AND' }, start: 0, end: 3 });
        at('status:new or', { code: ERRORS.misplacedConjunction, params: { conjunction: 'OR' }, start: 11, end: 13 });
        at('status:zzz', {
            code: ERRORS.unknownValue,
            params: { value: 'zzz', field: 'Status', choices: 'New, In progress, In review, Done' },
            start: 7,
            end: 10,
        });
        at('status:in', { code: ERRORS.ambiguousValue, params: { value: 'in', field: 'Status', choices: 'In progress, In review' }, start: 7, end: 9 });
        at('priority > high', { code: ERRORS.invalidOperator, params: { operator: '>', field: 'Priority' }, start: 9, end: 10 });
        at('start ~ x', { code: ERRORS.invalidOperator, params: { operator: '~', field: 'Start date' }, start: 6, end: 7 });
        at('start:31/12/2026', { code: ERRORS.badDate, params: { value: '31/12/2026', field: 'Start date' }, start: 6, end: 16 });
        at('start:2026-02-30', { code: ERRORS.badDate, params: { value: '2026-02-30', field: 'Start date' }, start: 6, end: 16 });
        at('start between 2026-01-01', { code: ERRORS.betweenValues, params: { operator: 'between', field: 'Start date' }, start: 6, end: 24 });
        at('(status:new', { code: ERRORS.unbalancedBracket, params: { bracket: '(' }, start: 0, end: 1 });
        at('status:new)', { code: ERRORS.unbalancedBracket, params: { bracket: ')' }, start: 10, end: 11 });
        at('subject:"open', { code: ERRORS.unclosedQuote, params: { quote: '"' }, start: 8, end: 13 });
        at(': high', { code: ERRORS.unexpectedToken, params: { text: ':' }, start: 0, end: 1 });
    });

    test('errors keep the rest of the tree and come in text order', function (assert) {
        let { tree, errors } = read('status:zzz type:bug priority:');

        assert.deepEqual(
            errors.map((error) => error.code),
            [ERRORS.unknownValue, ERRORS.missingValue]
        );
        assert.deepEqual(shape(tree), { conjunction: 'AND', children: [{ field: 'issuetype.name', operator: ':', value: 'Bug' }] });
    });

    test('it never throws', function (assert) {
        for (let text of [null, undefined, ')', '(', ',', 'and', '"', "'", '!', 'a:b:c', 'between and', '(( ) )', 'x in , ,']) {
            let result = parse(text, schema, { today });

            assert.true(isGroup(result.tree), `${text} gives a tree`);
        }
    });

    test('an apostrophe at the edge of a value is refused', function (assert) {
        let codes = serialize(read("subject ~ \"'quoted'\"").tree).errors.map((error) => error.code);

        assert.deepEqual(codes, ['reservedApostrophe']);
    });

    for (let [name, text] of Object.entries(ROUND_TRIPS)) {
        test(`round trip: ${name}`, function (assert) {
            let first = read(text);

            assert.deepEqual(first.errors, [], 'it reads without errors');

            let serialized = serialize(first.tree);

            assert.deepEqual(serialized.errors, []);

            let second = read(serialized.query);

            assert.deepEqual(second.errors, []);
            assert.deepEqual(shape(second.tree), shape(first.tree), 'parse(serialize(parse(q))) equals parse(q)');
            assert.strictEqual(serialize(second.tree).query, serialized.query, 'serializing again is stable');
        });
    }
});
