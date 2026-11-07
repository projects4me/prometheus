import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | prometheus list', function (hooks) {
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
});
