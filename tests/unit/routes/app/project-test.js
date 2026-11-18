/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | app/project', function (hooks) {
    setupTest(hooks);

    test('setupController sets model, projectId and projectName from the loaded project without a query', function (assert) {
        let route = this.owner.lookup('route:app/project');
        Object.defineProperty(route, 'store', {
            configurable: true,
            get() { return { query: () => assert.ok(false, 'no extra project query') }; },
        });
        route.project = { id: '7', get: (key) => (key === 'name' ? 'Alpha' : null) };
        let values = {};
        let controller = { set: (key, value) => { values[key] = value; } };

        route.setupController(controller);

        assert.strictEqual(values.model, route.project);
        assert.strictEqual(values.projectId, '7');
        assert.strictEqual(values.projectName, 'Alpha');
    });

    test('setupController does not throw when no project matched the short code', function (assert) {
        let route = this.owner.lookup('route:app/project');
        route.project = undefined;
        let values = {};

        route.setupController({ set: (key, value) => { values[key] = value; } });

        assert.strictEqual(values.model, undefined);
        assert.strictEqual(values.projectId, undefined);
        assert.strictEqual(values.projectName, undefined);
    });

    module('afterModel issues preload', function (hooks) {
        let route, resolveQuery, controller, tracked;

        hooks.beforeEach(function () {
            route = this.owner.lookup('route:app/project');
            tracked = { current: '7', getProjectId() { return this.current; } };
            Object.defineProperty(route, 'trackedProject', { configurable: true, get() { return tracked; } });
            Object.defineProperty(route, 'store', {
                configurable: true,
                get() {
                    return { query: () => new Promise((resolve) => { resolveQuery = resolve; }) };
                },
            });
            controller = { values: {}, get(k) { return this.values[k]; }, set(k, v) { this.values[k] = v; } };
            route.controllerFor = () => controller;
            route.project = { id: '7' };
            controller.values.projectId = '7';
        });

        test('does not return the issues request, so nested routes are not blocked', function (assert) {
            let result = route.afterModel();

            assert.strictEqual(result, undefined);
            assert.deepEqual(route.issues, []);
        });

        test('fills the controller once the issues resolve', async function (assert) {
            route.afterModel();
            resolveQuery(['issue']);
            await route.issuesRequest;

            assert.deepEqual(controller.values.issues, ['issue']);
        });

        test('ignores a result that arrives after leaving the project', async function (assert) {
            route.afterModel();
            controller.values.projectId = '8';
            resolveQuery(['issue']);
            await route.issuesRequest;

            assert.strictEqual(controller.values.issues, undefined);
        });

        test('ignores the result of an older request for the same project', async function (assert) {
            route.afterModel();
            let older = resolveQuery;
            let olderRequest = route.issuesRequest;
            route.afterModel();
            resolveQuery(['new']);
            await route.issuesRequest;
            older(['old']);
            await olderRequest;

            assert.deepEqual(controller.values.issues, ['new']);
        });

        test('does not report the failure of a superseded request', async function (assert) {
            let handled = [];
            Object.defineProperty(route, 'errorManager', { configurable: true, get() { return { handleError: (e) => handled.push(e) }; } });
            let rejects = [];
            Object.defineProperty(route, 'store', {
                configurable: true,
                get() { return { query: () => new Promise((resolve, reject) => { rejects.push(reject); }) }; },
            });
            route.afterModel();
            let olderRequest = route.issuesRequest;
            route.afterModel();
            rejects[0](new Error('old'));
            await olderRequest;

            assert.strictEqual(handled.length, 0);
        });

        test('reports a failed issues query and keeps the list empty', async function (assert) {
            let handled = [];
            Object.defineProperty(route, 'errorManager', { configurable: true, get() { return { handleError: (e) => handled.push(e) }; } });
            Object.defineProperty(route, 'store', {
                configurable: true,
                get() { return { query: () => Promise.reject(new Error('boom')) }; },
            });
            route.afterModel();
            await route.issuesRequest;

            assert.strictEqual(handled.length, 1);
            assert.deepEqual(route.issues, []);
        });
    });
});
