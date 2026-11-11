import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | prometheus/projectrelated issue search', function (hooks) {
    setupTest(hooks);

    // The issue create controller inherits the search task from the ProjectRelated base, like the board,
    // conversation and wiki controllers do. Its # issue search is what the editor gets as @issueSearch.
    function setup(owner, queries) {
        const controller = owner.lookup('controller:app.project.issue.create');
        Object.defineProperty(controller, 'store', {
            configurable: true,
            value: {
                query(type, options) {
                    queries.push({ type, options });
                    return Promise.resolve([{ id: '1', issueNumber: 12, subject: 'Twelve' }]);
                },
            },
        });
        Object.defineProperty(controller, 'trackedProject', {
            configurable: true,
            value: { getProjectId: () => 'p1' },
        });
        return controller;
    }

    test('it waits for the debounce and then asks the store for issues of the tracked project', async function (assert) {
        const queries = [];
        const controller = setup(this.owner, queries);

        const results = await controller.search.perform('12');

        assert.strictEqual(queries.length, 1, 'one issue query');
        assert.strictEqual(queries[0].type, 'issue');
        assert.ok(queries[0].options.query.includes('Issue.issueNumber CONTAINS 12'), 'it searches the typed number');
        assert.ok(queries[0].options.query.includes('Issue.projectId : p1'), 'it stays in the tracked project');
        assert.strictEqual(results.length, 1, 'the suggestions are returned to the editor');
        assert.strictEqual(results[0].subject, 'Twelve');
    });

    test('a search that is cancelled before the debounce ends never queries the store', async function (assert) {
        const queries = [];
        const controller = setup(this.owner, queries);

        const first = controller.search.perform('1');
        first.cancel();
        await first.catch(() => {});

        assert.strictEqual(queries.length, 0, 'no query was sent');
        assert.true(first.isCanceled, 'the search was cancelled');
    });
});
