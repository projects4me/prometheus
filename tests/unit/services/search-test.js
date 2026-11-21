/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Service | search', function (hooks) {
    setupTest(hooks);

    function stubStore(context, { matches, meta = { semantic: 'ok' }, issues = [] }) {
        const calls = [];
        context.owner.register('service:store', class extends Service {
            query(model, params) {
                calls.push({ model, params });
                if (model === 'searchresult') {
                    const list = matches.slice();
                    list.meta = meta;
                    return Promise.resolve(list);
                }
                return Promise.resolve(issues);
            }
        });
        return calls;
    }

    test('a query shorter than 2 characters sends no request', async function (assert) {
        const calls = stubStore(this, { matches: [] });
        const found = await this.owner.lookup('service:search').issues(' a ');
        assert.deepEqual(found, { results: [], semanticUnavailable: false });
        assert.strictEqual(calls.length, 0, 'Gaia would refuse it');
    });

    test('searches issues and reads the matches in one query, keeping the search order', async function (assert) {
        const calls = stubStore(this, {
            matches: [
                { recordId: 'b', snippet: '<mark>two</mark>', pinned: true },
                { recordId: 'a', snippet: null, pinned: false },
                { recordId: 'gone', snippet: null, pinned: false }
            ],
            issues: [{ id: 'a', subject: 'one' }, { id: 'b', subject: 'two' }]
        });

        const found = await this.owner.lookup('service:search').issues('two', 5);

        assert.deepEqual(calls[0], { model: 'searchresult', params: { types: 'issue', q: 'two', limit: 5 } });
        assert.strictEqual(calls[1].model, 'issue');
        assert.strictEqual(calls[1].params.query, "(Issue.id CONTAINS 'b','a','gone')");
        assert.strictEqual(calls[1].params.rels, 'project');
        assert.deepEqual(found.results.map((r) => r.issue.id), ['b', 'a'], 'ranked order; the unread id is dropped');
        assert.deepEqual(found.results[0].snippet, [{ text: 'two', match: true }]);
        assert.true(found.results[0].pinned);
        assert.false(found.semanticUnavailable);
    });

    test('reports semantic matching as unavailable', async function (assert) {
        stubStore(this, { matches: [], meta: { semantic: 'unavailable' } });
        const found = await this.owner.lookup('service:search').issues('login');
        assert.true(found.semanticUnavailable);
        assert.deepEqual(found.results, []);
    });

    test('a failed search rejects', async function (assert) {
        this.owner.register('service:store', class extends Service {
            query() {
                return Promise.reject(new Error('down'));
            }
        });
        await assert.rejects(this.owner.lookup('service:search').issues('login'), /down/);
    });
});
