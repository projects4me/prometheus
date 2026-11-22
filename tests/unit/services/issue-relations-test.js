/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | issue-relations', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        this.service = this.owner.lookup('service:issue-relations');
        this.store = this.owner.lookup('service:store');
        // Mirage's list handler does not filter issues; answer the children query the way Gaia does
        this.server.get('/issue', (schema, request) => {
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
});
