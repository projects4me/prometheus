/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createContext, valueSource, VALUE_SOURCES } from 'prometheus/utils/query/value-sources';
import MD from 'prometheus/utils/metadata/metadata';

module('Unit | Utility | query/value-sources', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        let users = this.server.createList('user', 2);
        let type = this.server.create('issuetype', { name: 'bug' });
        let status = this.server.create('issuestatus', { name: 'in_review' });
        let project = this.server.create('project', { members: users, issuetypes: [type], issuestatuses: [status] });

        this.server.create('issuestatus', { name: 'in_progress', system: '1' });
        this.server.create('milestone', { name: 'Sprint 1', projectId: project.id });
        this.users = users;
        this.project = project;
        this.context = (projectId = project.id) =>
            createContext({ owner: this.owner.lookup('service:query-schema'), store: this.owner.lookup('service:store'), intl: this.owner.lookup('service:intl'), projectId });
    });

    test('the registry names the sources and nothing else', function (assert) {
        assert.deepEqual(Object.keys(VALUE_SOURCES).sort(), ['issueStatuses', 'issueTypes', 'members', 'milestones', 'translation', 'users']);
        assert.strictEqual(valueSource('members'), VALUE_SOURCES.members);
        assert.strictEqual(valueSource('nope'), null);
        assert.strictEqual(valueSource('toString'), null, 'inherited names are not sources');
    });

    test('translation lists a translation key', async function (assert) {
        let values = await VALUE_SOURCES.translation({ key: 'views.app.issue.lists.priority' }, this.context());

        assert.deepEqual(values.map((v) => v.value).sort(), ['blocker', 'critical', 'high', 'low', 'medium']);
        assert.ok(values.every((v) => typeof v.label === 'string' && v.label !== ''));
    });

    test('issueStatuses lists the project statuses, or the system ones without a project', async function (assert) {
        assert.deepEqual((await VALUE_SOURCES.issueStatuses({}, this.context())).map((v) => v.value), ['in_review']);
        // Mirage does not filter on Issuestatus.system, so only check the system status is listed.
        assert.true((await VALUE_SOURCES.issueStatuses({}, this.context(null))).some((v) => v.value === 'in_progress'));
    });

    test('milestones lists the project milestones', async function (assert) {
        assert.deepEqual((await VALUE_SOURCES.milestones({}, this.context())).map((v) => v.value), ['Sprint 1']);
        assert.deepEqual(await VALUE_SOURCES.milestones({}, this.context(null)), []);
    });

    test('issueTypes lists the project issue types', async function (assert) {
        assert.deepEqual((await VALUE_SOURCES.issueTypes({}, this.context())).map((v) => v.value), ['bug']);
    });

    test('members lists the project members with their avatars', async function (assert) {
        let members = await VALUE_SOURCES.members({}, this.context());

        assert.deepEqual(members.map((m) => m.id).sort(), this.users.map((u) => u.id).sort());
        assert.ok(members.every((m) => m.value === m.label && 'profilePicture' in m));
    });

    test('users lists all users with their avatars', async function (assert) {
        this.server.create('user');

        let users = await VALUE_SOURCES.users({}, this.context());

        assert.strictEqual(users.length, this.server.db.users.length);
        assert.ok(users.every((u) => u.value === u.label && 'id' in u && 'profilePicture' in u));
    });

    test('the project is loaded once per context', async function (assert) {
        let context = this.context();
        let requests = 0;

        this.server.pretender.handledRequest = (verb, url) => {
            if (verb === 'GET' && /\/project\b/.test(url)) {
                requests++;
            }
        };

        await Promise.all([VALUE_SOURCES.members({}, context), VALUE_SOURCES.issueTypes({}, context), VALUE_SOURCES.issueStatuses({}, context)]);
        assert.strictEqual(requests, 1);
    });

    test('every search field in the metadata names a registered source', function (assert) {
        let views = MD.create().views;
        let named = Object.entries(views)
            .filter(([, view]) => view && view.search)
            .flatMap(([module, view]) => Object.entries(view.search.fields || {}).map(([id, field]) => [`${module}.${id}`, field.values]))
            .filter(([, values]) => values);

        assert.ok(named.length > 0, 'the metadata declares searchable fields with values');
        named.forEach(([field, values]) => assert.ok(valueSource(values.source), `${field} names "${values.source}"`));
    });
});
