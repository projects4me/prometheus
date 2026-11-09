/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import MD from 'prometheus/utils/metadata/metadata';
import { parse } from 'prometheus/utils/query/parse';
import { serialize } from 'prometheus/utils/query/serializer';

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

    test('a module without search metadata has no schema', async function (assert) {
        assert.strictEqual(await this.service.load('Nope'), null);
    });

    test('an unknown value source is refused and not cached', async function (assert) {
        let views = MD.create().views;

        views.QuerySchemaTest = {
            search: { module: 'QuerySchemaTest', fields: { 'QuerySchemaTest.kind': { label: 'x', type: 'enum', values: { source: 'nope' } } } },
        };

        try {
            await assert.rejects(this.service.load('QuerySchemaTest'), /Unknown search value source "nope"/);
            assert.strictEqual(this.service.cache.size, 0);
        } finally {
            delete views.QuerySchemaTest;
        }
    });

    test('TaskBoard extends Issue without the milestone field', async function (assert) {
        let schema = await this.service.load('TaskBoard', { projectId: this.project.id });
        let issue = await this.service.load('Issue', { projectId: this.project.id });
        let field = schema.resolveField('milestone');

        assert.strictEqual(schema.module, 'Issue');
        assert.strictEqual(schema.textField, 'Issue.subject');
        assert.deepEqual(
            schema.fields.map((f) => f.id),
            issue.fields.map((f) => f.id).filter((id) => id !== 'issuemilestone.name'),
            'the milestone is not a field'
        );
        assert.true(field.excluded, 'the milestone still resolves, as excluded');
        assert.strictEqual(field.reason, 'Use the milestone tabs.');
        assert.strictEqual(schema.resolveField('status').id, 'Issue.status', 'the other fields are kept');
    });

    test('an unknown extends or exclude is refused', async function (assert) {
        let views = MD.create().views;

        views.BadExtends = { search: { extends: 'Nope' } };
        views.BadExclude = { search: { extends: 'Issue', exclude: ['Issue.nope'] } };

        try {
            await assert.rejects(this.service.load('BadExtends'), /extends "Nope"/);
            await assert.rejects(this.service.load('BadExclude'), /excludes "Issue.nope"/);
        } finally {
            delete views.BadExtends;
            delete views.BadExclude;
        }
    });

    test('the fields keep the order of the metadata and share their value sources', async function (assert) {
        let schema = await this.service.load('Issue', { projectId: this.project.id });
        let meta = MD.create().getViewMeta('Issue', 'search');

        assert.deepEqual(schema.fields.map((field) => field.id), Object.keys(meta.fields));
        assert.strictEqual(schema.resolveField('owner').valueSource, schema.resolveField('assignee').valueSource);
        assert.strictEqual(schema.resolveField('prio').labelKey, 'views.app.issue.fields.priority');
    });

    test('the Conversationroom schema builds the room type, linked issue and liked by clauses', async function (assert) {
        let current = this.users[1];

        this.owner.lookup('service:current-user').set('user', { id: current.id, name: current.name });

        let schema = await this.service.load('Conversationroom', { projectId: this.project.id });
        let query = (text) => {
            let { tree, errors } = parse(text, schema);

            assert.deepEqual(errors, [], `${text} parses`);

            return serialize(tree).query;
        };

        assert.strictEqual(schema.textField, 'Conversationroom.subject');
        assert.strictEqual(query('type: vote'), '((Conversationroom.roomType : vote))');
        assert.strictEqual(query('type: Discussion'), '((Conversationroom.roomType : discussion))', 'the translated label resolves');
        assert.strictEqual(query('issue NULL'), '((Conversationroom.issueNumber NULL))');
        assert.strictEqual(query('issue !NULL'), '((Conversationroom.issueNumber !NULL))');
        assert.strictEqual(query(`liked: "${this.users[0].name}"`), `((votes.createdUser : ${this.users[0].id}))`, 'a member name resolves to the user id');
        assert.strictEqual(schema.resolveField('Liked by').id, 'votes.createdUser');
        assert.strictEqual(schema.resolveField('Linked issue').id, 'Conversationroom.issueNumber');
        assert.strictEqual(schema.resolveField('creator').id, 'createdBy.name');
        assert.strictEqual(schema.resolveField('created').id, 'Conversationroom.dateCreated');
        assert.strictEqual(schema.resolveField('updated').id, 'Conversationroom.dateModified');
        assert.strictEqual(schema.resolveField('description').id, 'Conversationroom.description');

        let likers = schema.valuesFor(schema.resolveField('liked'));

        assert.strictEqual(likers[0].id, current.id, 'the current user is listed first');
        assert.ok(likers.every((m) => m.value === m.id), 'liked by values are user ids');
        assert.ok(schema.valuesFor(schema.resolveField('creator')).every((m) => m.value === m.label), 'created by values stay names');
    });
});
