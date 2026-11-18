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
});
