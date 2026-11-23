/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Context from '../../../mirage/yadda-context/context';

module('Unit | Service | issue-relations', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        // Acceptance steps leave custom callbacks in the shared Mirage context; the handlers below must not see them
        new Context().clear();
        this.service = this.owner.lookup('service:issue-relations');
        this.store = this.owner.lookup('service:store');
        // Mirage's list handler does not filter issues; answer the children query the way Gaia does
        this.assigneeQueries = [];
        this.server.get('/issue', (schema, request) => {
            if (request.queryParams.rels === 'assignedTo') {
                this.assigneeQueries.push(request.queryParams.query);
                let ids = [...request.queryParams.query.matchAll(/Issue\.id : (\w+)/g)].map((found) => found[1]);
                return schema.issues.where((issue) => ids.includes(String(issue.id)));
            }
            let parentId = /Issue\.parentId : (\w+)/.exec(request.queryParams.query)[1];
            return schema.issues.where((issue) => String(issue.parentId) === parentId);
        });
        this.issue = (attrs = {}) => {
            let parent = attrs.parentId ? this.server.schema.issues.find(attrs.parentId) : null;
            return this.server.create('issue', { projectShortcode: 'AGAIA', ...attrs, parentissue: parent });
        };
        this.link = (type, source, target) => this.server.create('issuelink', { type, sourceIssueId: source.id, targetIssueId: target.id });
        this.open = (mirageIssue) => this.store.findRecord('issue', mirageIssue.id);
        this.ids = (rows) => rows.map((row) => row.issue.id).sort();
    });

    test('load resolves the assignee of every row with one assignee query per level', async function (assert) {
        let user = (name) => this.server.create('user', { name });
        let withAssignee = (attrs = {}) => {
            let assignedTo = user('Someone');
            return this.issue({ assignee: assignedTo.id, assignedTo, ...attrs });
        };
        let main = this.issue();
        let parent = withAssignee();
        main.update({ parentId: parent.id, parentissue: parent });
        let child = withAssignee({ parentId: main.id });
        let blocker = withAssignee();
        let blocked = withAssignee();
        let blockedBlocked = withAssignee();
        this.link('blocks', blocker, main);
        this.link('blocks', main, blocked);
        this.link('blocks', blocked, blockedBlocked);

        let groups = await this.service.load(await this.open(main));
        let rows = [...groups.parent, ...groups.children, ...groups.blockedBy, ...groups.blocks];
        assert.strictEqual(rows.length, 4);
        for (let row of rows) {
            assert.ok(row.issue.belongsTo('assignedTo').value(), `${row.relation} row has its assignee loaded`);
        }
        assert.strictEqual(this.assigneeQueries.length, 1, 'one assignee query for the whole level');

        let [next] = await this.service.loadNext(groups.blocks[0]);
        assert.strictEqual(next.issue.id, blockedBlocked.id);
        assert.ok(next.issue.belongsTo('assignedTo').value(), 'next-level row has its assignee loaded');
        assert.strictEqual(this.assigneeQueries.length, 2, 'one more query for the next level');
        assert.ok(child);
    });

    test('load returns empty groups for an issue without relations', async function (assert) {
        let groups = await this.service.load(await this.open(this.issue()));
        assert.deepEqual(Object.keys(groups), ['parent', 'blockedBy', 'splitFrom', 'children', 'splitInto', 'blocks', 'relates']);
        Object.values(groups).forEach((rows) => assert.strictEqual(rows.length, 0));
    });

    test('load groups every direct relation', async function (assert) {
        let main = this.issue();
        let parent = this.issue();
        main.update({ parentId: parent.id, parentissue: parent });
        let child = this.issue({ parentId: main.id });
        let blocker = this.issue();
        let blocked = this.issue();
        let origin = this.issue();
        let part = this.issue();
        let related = this.issue();
        let relatedBack = this.issue();
        this.link('blocks', blocker, main);
        this.link('blocks', main, blocked);
        this.link('splits', origin, main);
        this.link('splits', main, part);
        this.link('relates', main, related);
        this.link('relates', relatedBack, main);

        let groups = await this.service.load(await this.open(main));

        assert.deepEqual(this.ids(groups.parent), [parent.id]);
        assert.deepEqual(this.ids(groups.children), [child.id]);
        assert.deepEqual(this.ids(groups.blockedBy), [blocker.id]);
        assert.deepEqual(this.ids(groups.blocks), [blocked.id]);
        assert.deepEqual(this.ids(groups.splitFrom), [origin.id]);
        assert.deepEqual(this.ids(groups.splitInto), [part.id]);
        assert.deepEqual(this.ids(groups.relates), [related.id, relatedBack.id].sort(), 'relates counts in either direction');

        let [row] = groups.blockedBy;
        assert.strictEqual(row.depth, 1);
        assert.strictEqual(row.via, null);
        assert.strictEqual(row.relation, 'blockedBy');
        assert.strictEqual(row.link.type, 'blocks');
        assert.strictEqual(groups.parent[0].link, null);
        assert.strictEqual(groups.children[0].link, null);
        assert.strictEqual(row.issue.projectShortcode, 'AGAIA', 'the linked issue keeps its project short code');
    });

    test('loadNext goes one level further in the same direction', async function (assert) {
        let main = this.issue();
        let grand = this.issue();
        let parent = this.issue({ parentId: grand.id });
        main.update({ parentId: parent.id, parentissue: parent });
        let child = this.issue({ parentId: main.id });
        let grandchild = this.issue({ parentId: child.id });
        let blocker = this.issue();
        let blockerBlocker = this.issue();
        let blocked = this.issue();
        let blockedBlocked = this.issue();
        let origin = this.issue();
        let originOrigin = this.issue();
        let part = this.issue();
        let partPart = this.issue();
        this.link('blocks', blocker, main);
        this.link('blocks', blockerBlocker, blocker);
        this.link('blocks', main, blocked);
        this.link('blocks', blocked, blockedBlocked);
        this.link('splits', origin, main);
        this.link('splits', originOrigin, origin);
        this.link('splits', main, part);
        this.link('splits', part, partPart);

        let root = await this.open(main);
        let groups = await this.service.load(root);
        let expected = {
            parent: grand,
            children: grandchild,
            blockedBy: blockerBlocker,
            blocks: blockedBlocked,
            splitFrom: originOrigin,
            splitInto: partPart
        };
        for (let [relation, issue] of Object.entries(expected)) {
            let next = await this.service.loadNext(groups[relation][0]);
            assert.deepEqual(this.ids(next), [issue.id], `${relation} expands in its own direction`);
            assert.strictEqual(next[0].depth, 2);
            assert.strictEqual(next[0].via, groups[relation][0].issue);
            assert.strictEqual(next[0].relation, relation);
        }
    });

    test('loadNext does not expand relates rows', async function (assert) {
        let main = this.issue();
        let related = this.issue();
        let relatedToo = this.issue();
        this.link('relates', main, related);
        this.link('relates', related, relatedToo);
        let groups = await this.service.load(await this.open(main));
        assert.deepEqual(await this.service.loadNext(groups.relates[0]), []);
    });

    test('loadNext skips an issue already on the path, so cycles end', async function (assert) {
        let main = this.issue();
        let other = this.issue();
        let third = this.issue();
        this.link('blocks', other, main);
        this.link('blocks', main, other);
        this.link('blocks', third, other);

        let groups = await this.service.load(await this.open(main));
        let [row] = groups.blockedBy;
        assert.strictEqual(row.issue.id, other.id);
        let next = await this.service.loadNext(row);
        assert.deepEqual(this.ids(next), [third.id], 'main is skipped, it is where the path started');
        assert.deepEqual(await this.service.loadNext(next[0]), [], 'third has no blockers');
    });

    test('link creates an issuelink for the chosen direction', async function (assert) {
        let main = await this.open(this.issue());
        let other = await this.open(this.issue());
        await this.service.link(main, 'blockedBy', other);
        let links = this.server.schema.issuelinks.all().models;
        assert.strictEqual(links.length, 1);
        assert.strictEqual(links[0].type, 'blocks');
        assert.strictEqual(String(links[0].sourceIssueId), String(other.id), 'the other issue blocks');
        assert.strictEqual(String(links[0].targetIssueId), String(main.id));
    });

    test('link sets parentId for parent and child relations', async function (assert) {
        let main = await this.open(this.issue());
        let other = await this.open(this.issue());
        await this.service.link(main, 'parentOf', other);
        assert.strictEqual(String(this.server.schema.issues.find(other.id).parentId), String(main.id));
        let third = await this.open(this.issue());
        await this.service.link(main, 'childOf', third);
        assert.strictEqual(String(this.server.schema.issues.find(main.id).parentId), String(third.id));
    });

    test('link rethrows the 422 and keeps no record', async function (assert) {
        this.server.post('/issuelink', () => new Response(422, {}, { status: 'ERROR', messages: ['cycle'] }));
        let main = await this.open(this.issue());
        let other = await this.open(this.issue());
        try {
            await this.service.link(main, 'blocks', other);
            assert.ok(false, 'should fail');
        } catch (error) {
            assert.strictEqual(error.errors[0].detail, 'cycle');
        }
        assert.strictEqual(this.store.peekAll('issuelink').length, 0);
    });

    test('unlink deletes the link or clears parentId', async function (assert) {
        this.server.delete('/issuelink/:id', (schema, request) => {
            schema.issuelinks.find(request.params.id).destroy();
            return new Response(200, {}, { data: null });
        });
        let main = this.issue();
        let other = this.issue();
        let child = this.issue({ parentId: main.id });
        this.link('blocks', main, other);
        let groups = await this.service.load(await this.open(main));
        await this.service.unlink(await this.open(main), groups.blocks[0]);
        assert.strictEqual(this.server.schema.issuelinks.all().length, 0);
        await this.service.unlink(await this.open(main), groups.children[0]);
        assert.strictEqual(this.server.schema.issues.find(child.id).parentId, null);
    });
    module('openBlockers', function (hooks) {
        hooks.beforeEach(function () {
            this.server.get('/issuestatus', (schema, request) => {
                let projectId = /Issuestatus\.projectId : (\w+)/.exec(request.queryParams.query)[1];
                this.statusQueries = (this.statusQueries || 0) + 1;
                return schema.issuestatuses.where((status) => String(status.projectId) === projectId);
            });
            this.p1 = this.server.create('project').id;
            this.p2 = this.server.create('project').id;
            this.inProject = async (mirageIssue, projectId) => {
                let record = await this.open(mirageIssue);
                this.store.push({ data: { type: 'issue', id: record.id, attributes: { projectId: String(projectId) } } });
            };
            this.status = (projectId, name, done) => this.server.create('issuestatus', { projectId, name, done });
        });

        test('a blocker in a done status is excluded', async function (assert) {
            let main = this.issue({ projectId: this.p1 });
            let open = this.issue({ projectId: this.p1, status: 'new' });
            let done = this.issue({ projectId: this.p1, status: 'closed' });
            this.status(this.p1, 'new', '0');
            this.status(this.p1, 'closed', '1');
            await this.inProject(main, this.p1);
            await this.inProject(open, this.p1);
            await this.inProject(done, this.p1);
            this.link('blocks', open, main);
            this.link('blocks', done, main);
            this.link('blocks', main, this.issue({ projectId: this.p1, status: 'new' }));

            let blockers = await this.service.openBlockers(await this.open(main));

            assert.deepEqual(blockers.map((issue) => issue.id), [open.id]);
        });

        test('a blocker of another project is judged by its own project statuses, loaded once per project', async function (assert) {
            let main = this.issue({ projectId: this.p1 });
            let a = this.issue({ projectId: this.p2, status: 'shipped' });
            let b = this.issue({ projectId: this.p2, status: 'review' });
            this.status(this.p1, 'shipped', '0');
            this.status(this.p2, 'shipped', '1');
            this.status(this.p2, 'review', '0');
            await this.inProject(main, this.p1);
            await this.inProject(a, this.p2);
            await this.inProject(b, this.p2);
            this.link('blocks', a, main);
            this.link('blocks', b, main);

            let blockers = await this.service.openBlockers(await this.open(main));

            assert.deepEqual(blockers.map((issue) => issue.id), [b.id], 'shipped is done in p2 even though it is not in p1');
            assert.strictEqual(this.statusQueries, 1, 'one status query for the one other project');
        });
    });
});
