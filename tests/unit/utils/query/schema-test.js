/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { createSchema } from 'prometheus/utils/query/schema';

function issueSchema() {
    return createSchema({
        module: 'Issue',
        textField: 'Issue.subject',
        fields: [
            { id: 'Issue.subject', labelKey: 'x.subject', label: 'Subject', type: 'text' },
            { id: 'Issue.startDate', labelKey: 'x.start', label: 'Start date', type: 'date' },
            { id: 'Issue.endDate', labelKey: 'x.end', label: 'End date', type: 'date' },
            { id: 'Issue.priority', aliases: ['prio'], label: 'Priority', type: 'enum', valueSource: 'priorities' },
            { id: 'Issue.status', aliases: ['state'], label: 'Status', type: 'enum', valueSource: 'statuses' },
            { id: 'Issue.assignee', aliases: ['assigned'], label: 'Assignee', type: 'user', valueSource: 'users' },
            { id: 'issuetype.name', aliases: ['type'], label: 'Type', type: 'enum', valueSource: 'types' },
        ],
        values: {
            priorities: [
                { value: 'high', label: 'High' },
                { value: 'highest', label: 'Highest' },
                { value: 'low', label: 'Low' },
            ],
            statuses: [
                { value: 'in_progress', label: 'In progress' },
                { value: 'in_review', label: 'In review' },
                { value: 'done', label: 'Done' },
            ],
            users: [
                { value: 'u1', label: 'Hammad Hassan' },
                { value: 'u2', label: 'Agent Odysseus' },
            ],
        },
    });
}

module('Unit | Utility | query | schema', function () {
    test('it exposes its module, fields and text field', function (assert) {
        let schema = issueSchema();

        assert.strictEqual(schema.module, 'Issue');
        assert.strictEqual(schema.textField, 'Issue.subject');
        assert.strictEqual(schema.fields.length, 7);
        assert.strictEqual(createSchema({ module: 'Issue', fields: [{ id: 'Issue.x' }] }).fields[0].type, 'text', 'the type defaults to text');
    });

    test('1. it resolves the id without case', function (assert) {
        let schema = issueSchema();

        assert.strictEqual(schema.resolveField('Issue.startDate').id, 'Issue.startDate');
        assert.strictEqual(schema.resolveField('issue.STARTDATE').id, 'Issue.startDate');
        assert.strictEqual(schema.resolveField('ISSUETYPE.name').id, 'issuetype.name');
    });

    test('2. it resolves the id without its module prefix', function (assert) {
        let schema = issueSchema();

        assert.strictEqual(schema.resolveField('startdate').id, 'Issue.startDate');
        assert.strictEqual(schema.resolveField('name').id, 'issuetype.name');
    });

    test('3. it resolves an alias or the label', function (assert) {
        let schema = issueSchema();

        assert.strictEqual(schema.resolveField('prio').id, 'Issue.priority');
        assert.strictEqual(schema.resolveField('TYPE').id, 'issuetype.name');
        assert.strictEqual(schema.resolveField('start date').id, 'Issue.startDate');
    });

    test('4. it resolves a unique prefix of an alias or label', function (assert) {
        let schema = issueSchema();

        assert.strictEqual(schema.resolveField('assig').id, 'Issue.assignee');
        assert.strictEqual(schema.resolveField('stat').id, 'Issue.status', 'state and status are the same field');
        assert.strictEqual(schema.resolveField('pri').id, 'Issue.priority');
        assert.strictEqual(schema.resolveField('sta').id, 'Issue.sta', 'status and start date both start with sta');
    });

    test('an ambiguous prefix and unknown words fall back to text fields', function (assert) {
        let schema = issueSchema();

        let ambiguous = schema.resolveField('s');
        assert.deepEqual({ ...ambiguous }, { id: 'Issue.s', type: 'text' }, 'subject, start date and status all start with s');

        let word = schema.resolveField('milestone');
        assert.deepEqual({ ...word }, { id: 'Issue.milestone', type: 'text' }, 'a word gets the module prefix');

        let qualified = schema.resolveField('Project.name');
        assert.deepEqual({ ...qualified }, { id: 'Project.name', type: 'text' }, 'an unknown Module.field is kept');

        assert.strictEqual(schema.resolveField('  '), null);
        assert.strictEqual(schema.resolveField(undefined), null);
    });

    test('it resolves enum and user values', function (assert) {
        let schema = issueSchema();
        let priority = schema.resolveField('priority');
        let status = schema.resolveField('status');
        let assignee = schema.resolveField('assignee');

        assert.deepEqual(schema.resolveValue(priority, 'HIGH'), { value: 'high', candidates: [] }, 'an exact label wins over a prefix');
        assert.deepEqual(schema.resolveValue(status, 'done'), { value: 'done', candidates: [] }, 'an exact value');
        assert.deepEqual(schema.resolveValue(priority, 'lo'), { value: 'low', candidates: [] }, 'a unique prefix');
        assert.deepEqual(schema.resolveValue(assignee, 'agent'), { value: 'u2', candidates: [] }, 'a user by name prefix');

        let ambiguous = schema.resolveValue(status, 'in');
        assert.strictEqual(ambiguous.value, null);
        assert.deepEqual(ambiguous.candidates.map((c) => c.value), ['in_progress', 'in_review'], 'an ambiguous prefix gives the candidates');

        assert.deepEqual(schema.resolveValue(priority, 'urgent'), { value: null, candidates: [] }, 'no match');
        assert.deepEqual(schema.resolveValue(priority, ''), { value: null, candidates: [] });
        assert.deepEqual(schema.resolveValue(schema.resolveField('type'), 'Bug'), { value: null, candidates: [] }, 'a source without values');
    });

    test('other fields keep the typed value', function (assert) {
        let schema = issueSchema();

        assert.deepEqual(schema.resolveValue(schema.resolveField('subject'), ' login page '), { value: 'login page', candidates: [] });
        assert.deepEqual(schema.resolveValue(schema.resolveField('start'), '2026-11-07'), { value: '2026-11-07', candidates: [] });
    });
});
