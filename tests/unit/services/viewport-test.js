/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | viewport', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.original = window.matchMedia;
        this.listeners = new Set();
        this.removed = 0;
        this.stub = (matches) => {
            const mql = {
                matches,
                addEventListener: (type, fn) => type === 'change' && this.listeners.add(fn),
                removeEventListener: (type, fn) => {
                    this.removed++;
                    this.listeners.delete(fn);
                }
            };
            window.matchMedia = (query) => {
                this.query = query;
                return mql;
            };
        };
    });

    hooks.afterEach(function () {
        window.matchMedia = this.original;
    });

    test('starts with the current match', function (assert) {
        this.stub(true);
        assert.true(this.owner.lookup('service:viewport').isPhone);
        assert.strictEqual(this.query, '(max-width: 767px)');
    });

    test('updates on change', function (assert) {
        this.stub(false);
        const service = this.owner.lookup('service:viewport');
        assert.false(service.isPhone);
        this.listeners.forEach((fn) => fn({ matches: true }));
        assert.true(service.isPhone);
        this.listeners.forEach((fn) => fn({ matches: false }));
        assert.false(service.isPhone);
    });

    test('removes the listener on destroy', function (assert) {
        this.stub(false);
        const service = this.owner.lookup('service:viewport');
        assert.strictEqual(this.listeners.size, 1);
        service.destroy();
        return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
            assert.strictEqual(this.listeners.size, 0);
            assert.strictEqual(this.removed, 1);
        });
    });

    test('is false without matchMedia', function (assert) {
        window.matchMedia = undefined;
        assert.false(this.owner.lookup('service:viewport').isPhone);
    });
});
