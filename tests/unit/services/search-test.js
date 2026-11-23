/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Service | search', function (hooks) {
    setupTest(hooks);

    const realFetch = window.fetch;
    hooks.afterEach(function () {
        window.fetch = realFetch;
    });

    function stubStore(context, { matches, issues = [] }) {
        const calls = [];
        context.owner.register('service:session', class extends Service {
            data = { authenticated: { access_token: 'tok' } };
        });
        context.owner.register('service:store', class extends Service {
            query(model, params) {
                calls.push({ model, params });
                return Promise.resolve(issues);
            }
        });
        const fetches = [];
        window.fetch = (url, options) => {
            fetches.push({ url: String(url), options });
            return Promise.resolve(new Response(JSON.stringify({
                data: matches.map((attributes) => ({ type: 'searchresult', id: `issue:${attributes.recordId}`, attributes })),
                meta: { semantic: 'ok' }
            })));
        };
        calls.fetches = fetches;
        return calls;
    }

    test('a query shorter than 2 characters sends no request', async function (assert) {
        const calls = stubStore(this, { matches: [] });
        const found = await this.owner.lookup('service:search').issues(' a ');
        assert.deepEqual(found, []);
        assert.strictEqual(calls.fetches.length, 0, 'Gaia would refuse it');
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

        const url = new URL(calls.fetches[0].url);
        assert.true(url.pathname.endsWith('/search'));
        assert.deepEqual(Object.fromEntries(url.searchParams), { types: 'issue', q: 'two', limit: '5' });
        assert.strictEqual(calls.fetches[0].options.headers.Authorization, 'Bearer tok');
        assert.strictEqual(calls[0].model, 'issue');
        assert.strictEqual(calls[0].params.query, "(Issue.id CONTAINS 'b','a','gone')");
        assert.strictEqual(calls[0].params.rels, 'project');
        assert.deepEqual(found.map((r) => r.issue.id), ['b', 'a'], 'ranked order; the unread id is dropped');
        assert.deepEqual(found[0].snippet, [{ text: 'two', match: true }]);
        assert.true(found[0].pinned);
    });

    test('a search with no matches skips the issue query', async function (assert) {
        const calls = stubStore(this, { matches: [] });
        const found = await this.owner.lookup('service:search').issues('login');
        assert.deepEqual(found, []);
        assert.strictEqual(calls.length, 0, 'no issue query');
    });

    test('a failed search rejects', async function (assert) {
        stubStore(this, { matches: [] });
        window.fetch = () => Promise.resolve(new Response('{}', { status: 500 }));
        await assert.rejects(this.owner.lookup('service:search').issues('login'), /Search failed: 500/);
    });
});
