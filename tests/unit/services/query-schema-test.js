/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | query-schema', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        let users = this.server.createList('user', 2);
        let type = this.server.create('issuetype', { name: 'bug' });
        let project = this.server.create('project', { members: users, issuetypes: [type] });

        this.server.create('issuestatus', { name: 'in_progress', system: '1' });
        this.server.create('milestone', { name: 'Sprint 1', projectId: project.id });
        this.project = project;
        this.users = users;
        this.service = this.owner.lookup('service:query-schema');
    });

    test('the Issue schema resolves the aliases and labels of every field', async function (assert) {
        let schema = await this.service.load('Issue', { projectId: this.project.id });
        let expected = {
            number: 'Issue.issueNumber',
            '#': 'Issue.issueNumber',
            subject: 'Issue.subject',
            status: 'Issue.status',
            milestone: 'issuemilestone.name',
            type: 'issuetype.name',
            priority: 'Issue.priority',
            prio: 'Issue.priority',
            start: 'Issue.startDate',
            end: 'Issue.endDate',
            parent: 'parentissue.issueNumber',
            assignee: 'assignedTo.name',
            owner: 'ownedBy.name',
            reporter: 'reportedBy.name',
            'Reported User': 'reportedBy.name',
        };

        Object.entries(expected).forEach(([word, id]) => assert.strictEqual(schema.resolveField(word).id, id, word));
        assert.strictEqual(schema.textField, 'Issue.subject');
        assert.strictEqual(schema.resolveField('Issue.startDate').type, 'date');
        assert.strictEqual(schema.resolveField('parent').type, 'number');
        assert.strictEqual(schema.resolveField('assignee').type, 'user');
        assert.strictEqual(schema.resolveField('prio').type, 'enum');
    });

    test('the Issue schema lists the values of the project', async function (assert) {
        let schema = await this.service.load('Issue', { projectId: this.project.id });

        assert.deepEqual(schema.valuesFor(schema.resolveField('milestone')).map((v) => v.value), ['Sprint 1']);
        assert.deepEqual(schema.valuesFor(schema.resolveField('type')).map((v) => v.value), ['bug']);
        assert.deepEqual(schema.valuesFor(schema.resolveField('priority')).map((v) => v.value).sort(), ['blocker', 'critical', 'high', 'low', 'medium']);
        assert.strictEqual(schema.resolveValue(schema.resolveField('prio'), 'hi').value, 'high');
        assert.true(schema.valuesFor(schema.resolveField('status')).length > 0, 'statuses are listed');

        let members = schema.valuesFor(schema.resolveField('assignee'));

        assert.strictEqual(members.length, 2);
        assert.deepEqual(members.map((m) => m.id).sort(), this.users.map((u) => u.id).sort());
        assert.ok(members.every((m) => m.value === m.label && 'profilePicture' in m));
    });

    test('the Project schema resolves its aliases and labels', async function (assert) {
        let schema = await this.service.load('Project');

        assert.strictEqual(schema.resolveField('name').id, 'Project.name');
        assert.strictEqual(schema.resolveField('code').id, 'Project.shortCode');
        assert.strictEqual(schema.resolveField('Short Code').id, 'Project.shortCode');
        assert.strictEqual(schema.resolveField('status').id, 'Project.status');
        assert.strictEqual(schema.resolveField('manager').id, 'manager.name');
        assert.strictEqual(schema.textField, 'Project.name');
        assert.strictEqual(schema.resolveValue(schema.resolveField('status'), 'in progress').value, 'in_progress');
    });

    test('schemas are cached per module and project', async function (assert) {
        let first = this.service.load('Issue', { projectId: this.project.id });

        assert.strictEqual(this.service.load('Issue', { projectId: this.project.id }), first, 'concurrent callers share the load');

        let schema = await first;

        assert.strictEqual(await this.service.load('Issue', { projectId: this.project.id }), schema);
        assert.notStrictEqual(await this.service.load('Issue', { projectId: 999 }), schema, 'another project loads its own');

        this.service.clear();
        assert.notStrictEqual(await this.service.load('Issue', { projectId: this.project.id }), schema, 'clear forgets the cache');
    });

    test('an unknown module is refused and not cached', async function (assert) {
        await assert.rejects(this.service.load('Nope'), /No query schema/);
        assert.strictEqual(this.service.cache.size, 0);
    });
});
