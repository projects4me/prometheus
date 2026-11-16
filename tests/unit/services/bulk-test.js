/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import ENV from 'prometheus/config/environment';
import ForbiddenError from 'prometheus/adapters/errors/forbidden-error';

const ISSUE_QUERY = {
    query: "((Issue.projectId : 'p 1') AND (Issue.status IN ['new','done']))",
    rels: 'assignedTo,milestone',
    sort: 'Issue.dateCreated',
    order: 'DESC',
    limit: -1
};

module('Unit | Service | bulk', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        this.service = this.owner.lookup('service:bulk');
        this.store = this.owner.lookup('service:store');
        this.bulkCalls = [];
        this.gets = [];
        this.warnings = [];
        this.originalWarn = console.warn;
        console.warn = (...args) => this.warnings.push(args);

        // record each bulk body and each separate GET; the Mirage handlers still answer them
        this.server.pretender.handledRequest = (verb, path, request) => {
            if (verb === 'POST' && path.endsWith('/bulk')) {
                this.bulkCalls.push(JSON.parse(request.requestBody).requests);
            } else if (verb === 'GET') {
                this.gets.push(request.url);
            }
        };
    });

    hooks.afterEach(function () {
        console.warn = this.originalWarn;
    });

    test('it builds the same URL store.query sends, relative to the host', async function (assert) {
        await this.store.query('issue', ISSUE_QUERY);
        let sent = this.gets.at(-1);

        let url = this.service.urlFor('issue', ISSUE_QUERY);

        assert.true(url.startsWith(`/api/v${ENV.api.version}/issue?`), 'relative /api/v1 path');
        assert.strictEqual(`${ENV.api.host}${url}`, sent, 'matches the store.query URL');
    });

    test('it sends one bulk request and pushes each result into the store', async function (assert) {
        this.server.createList('issuestatus', 3);
        this.server.createList('milestone', 2);

        let results = await this.service.query([
            { id: 'statuses', modelName: 'issuestatus', query: { query: '', limit: -1 } },
            { id: 'milestones', modelName: 'milestone', query: { limit: -1 } }
        ]);

        assert.strictEqual(this.bulkCalls.length, 1, 'one bulk request');
        assert.deepEqual(this.bulkCalls[0].map((item) => [item.id, item.method]), [['statuses', 'GET'], ['milestones', 'GET']]);
        assert.strictEqual(this.bulkCalls[0][1].url, this.service.urlFor('milestone', { limit: -1 }));
        assert.strictEqual(this.gets.length, 0, 'no separate GET calls');

        assert.strictEqual(results.statuses.records.length, 3);
        assert.strictEqual(results.milestones.records.length, 2);
        assert.strictEqual(results.statuses.records[0].constructor.modelName, 'issuestatus', 'Ember Data records');
        assert.strictEqual(this.store.peekAll('issuestatus').length, 3, 'statuses are in the store');
        assert.strictEqual(this.store.peekAll('milestone').length, 2, 'milestones are in the store');
    });

    test('one failing item does not affect the others', async function (assert) {
        this.server.createList('milestone', 2);
        this.server.get('/issuestatus', () => new Response(403, {}, { error: 'Forbidden' }));

        let results = await this.service.query([
            { id: 'statuses', modelName: 'issuestatus', query: {} },
            { id: 'milestones', modelName: 'milestone', query: {} }
        ]);

        assert.strictEqual(this.bulkCalls.length, 1);
        assert.ok(results.statuses.error, 'the failed item has an error');
        assert.true(results.statuses.error instanceof ForbiddenError, 'the adapter error for its status');
        assert.notOk(results.statuses.records);
        assert.strictEqual(results.milestones.records.length, 2, 'the other item still has its records');
        assert.strictEqual(this.warnings.length, 0, 'no fallback');
    });

    test('it splits batches above the limit and merges the results', async function (assert) {
        this.server.createList('milestone', 1);
        let items = Array.from({ length: 26 }, (unused, index) => ({
            id: `m${index}`,
            modelName: 'milestone',
            query: { limit: index + 1 }
        }));

        let results = await this.service.query(items);

        assert.deepEqual(this.bulkCalls.map((call) => call.length).sort((a, b) => b - a), [25, 1], 'two bulk requests of 25 and 1');
        assert.strictEqual(Object.keys(results).length, 26, 'every id has a result');
        assert.true(Object.values(results).every((result) => result.records?.length === 1));
    });

    test('a 403 on the bulk call falls back to separate queries', async function (assert) {
        this.server.createList('issuestatus', 2);
        this.server.createList('milestone', 1);
        this.server.post('/bulk', () => new Response(403, {}, { error: 'bulk.create denied' }));

        let results = await this.service.query([
            { id: 'statuses', modelName: 'issuestatus', query: { query: '' } },
            { id: 'milestones', modelName: 'milestone', query: {} }
        ]);

        assert.strictEqual(this.gets.length, 2, 'one GET per item');
        assert.strictEqual(results.statuses.records.length, 2);
        assert.strictEqual(results.milestones.records.length, 1);
        assert.strictEqual(this.warnings.length, 1, 'one warning');
    });

    test('after a failed bulk call the remaining batches skip bulk too', async function (assert) {
        this.server.createList('milestone', 1);
        this.server.post('/bulk', (schema, request) => {
            this.bulkCalls.push(JSON.parse(request.requestBody).requests);
            return new Response(403, {}, { error: 'bulk.create denied' });
        });
        this.server.pretender.handledRequest = (verb, path, request) => {
            if (verb === 'GET') {
                this.gets.push(request.url);
            }
        };
        let items = Array.from({ length: 26 }, (unused, index) => ({ id: `m${index}`, modelName: 'milestone', query: { limit: index + 1 } }));

        let results = await this.service.query(items);

        assert.strictEqual(this.bulkCalls.length, 1, 'only the first bulk request was tried');
        assert.strictEqual(this.gets.length, 26, 'every item ran on its own');
        assert.true(Object.values(results).every((result) => result.records?.length === 1));
        assert.strictEqual(this.warnings.length, 1, 'one warning');
    });

    test('a failed bulk call falls back and keeps per-item errors', async function (assert) {
        this.server.createList('milestone', 1);
        this.server.post('/bulk', () => new Response(500, {}, { error: 'boom' }));
        this.server.get('/issuestatus', () => new Response(404, {}, { error: 'Not Found' }));

        let results = await this.service.query([
            { id: 'statuses', modelName: 'issuestatus', query: {} },
            { id: 'milestones', modelName: 'milestone', query: {} }
        ]);

        assert.ok(results.statuses.error, 'the failing query has its error');
        assert.strictEqual(results.milestones.records.length, 1, 'the other query still has its records');
        assert.strictEqual(this.warnings.length, 1, 'one warning');
    });

    test('an item no route serves fails on its own without a fallback', async function (assert) {
        this.server.createList('milestone', 1);

        let results = await this.service.query([
            { id: 'x', modelName: 'nosuchresource', query: {} },
            { id: 'milestones', modelName: 'milestone', query: {} }
        ]);

        assert.ok(results.x.error, 'the unknown item has its error');
        assert.strictEqual(results.milestones.records.length, 1);
        assert.strictEqual(this.gets.length, 0, 'no separate request');
        assert.strictEqual(this.warnings.length, 0, 'no fallback');
    });

    test('it refuses missing or repeated ids', async function (assert) {
        await assert.rejects(this.service.query([
            { id: 'a', modelName: 'milestone', query: {} },
            { id: 'a', modelName: 'milestone', query: {} }
        ]), /unique id/);
        assert.strictEqual(this.bulkCalls.length, 0);
    });
});
