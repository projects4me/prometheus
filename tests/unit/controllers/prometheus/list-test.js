import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | prometheus list', function (hooks) {
    let originalMessenger = globalThis.Messenger;

    hooks.afterEach(function () {
        globalThis.Messenger = originalMessenger;
    });

    setupTest(hooks);

    test('applyQuery keeps the query and goes back to the first page', function (assert) {
        let controller = this.owner.lookup('controller:app/project/issue/index');

        controller.set('page', 4);
        controller.applyQuery('(Issue.status : done)');

        assert.strictEqual(controller.queryString, '(Issue.status : done)');
        assert.strictEqual(controller.query, '(Issue.status : done)');
        assert.strictEqual(controller.page, 1);
    });

    test('applyQuery with an empty query clears the search', function (assert) {
        let controller = this.owner.lookup('controller:app/project/issue/index');

        controller.set('query', '(Issue.status : done)');
        controller.applyQuery('');

        assert.strictEqual(controller.query, '');
        assert.strictEqual(controller.page, 1);
    });

    test('selectSavedSearch sets and clears the active saved search', function (assert) {
        let controller = this.owner.lookup('controller:app/project/issue/index');
        let record = { id: '3', get: (key) => ({ id: '3' })[key] };

        controller.set('savedsearches', [record]);
        controller.selectSavedSearch({ id: 3, name: 'x', query: 'y' });
        assert.strictEqual(controller.searchId, '3');
        assert.strictEqual(controller.activeSearch, record);

        controller.selectSavedSearch(null);
        assert.strictEqual(controller.searchId, null);
        assert.strictEqual(controller.activeSearch, null);
    });

    test('ezSavedSearches maps the saved search records', function (assert) {
        let controller = this.owner.lookup('controller:app/projects/index');
        let record = { get: (key) => ({ id: '3', name: 'Mine', searchquery: '(a : b)' })[key] };

        controller.set('savedsearches', [record]);

        assert.deepEqual(controller.ezSavedSearches, [{ id: '3', name: 'Mine', query: '(a : b)' }]);
    });

    test('showEzSaveSearchDialog keeps the query and opens the dialog', function (assert) {
        let controller = this.owner.lookup('controller:app/projects/index');

        controller.showEzSaveSearchDialog('(a : b)');

        assert.strictEqual(controller.saveSearchQuery, '(a : b)');
        assert.true(controller.saveSearchDialog);
    });

    test('saveEzSearch saves with the list context using a fake store', async function (assert) {
        let controller = this.owner.lookup('controller:app/projects/index');
        let values = {};
        let saved = { get: () => 'Mine' };
        let fresh = {};
        let record = { set: (k, v) => { values[k] = v; }, save: async () => saved };

        controller.set('newSavedsearch', record);
        controller.set('saveSearchQuery', '(a : b)');
        controller.set('store', { createRecord: () => fresh });
        controller.set('intl', { t: (key) => key });
        controller.send = () => {};
        globalThis.Messenger = function () { return { post: () => {} }; };

        await controller.saveEzSearch();

        assert.strictEqual(values.relatedTo, 'project');
        assert.strictEqual(values.searchquery, '(a : b)');
        assert.false('projectId' in values);
        assert.deepEqual(controller.savedsearches, [saved]);
        assert.strictEqual(controller.newSavedsearch, fresh);
    });

    test('saveEzSearch with an empty query saves nothing', async function (assert) {
        let controller = this.owner.lookup('controller:app/projects/index');
        let posted = [];

        controller.set('saveSearchQuery', '');
        controller.set('intl', { t: (key) => key });
        controller.send = () => {};
        globalThis.Messenger = function () { return { post: (o) => posted.push(o) }; };

        await controller.saveEzSearch();

        assert.strictEqual(posted[0].message, 'views.app.project.list.savedsearch.missing');
    });
});
