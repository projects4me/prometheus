/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Route | application', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:translations', class extends Service { async load() {} });
        this.owner.register('service:router', class extends Service { on() {} transitionTo() {} location = { path: '/' }; });
    });

    hooks.afterEach(function () {
        document.querySelector('[data-boot-loader]')?.remove();
    });

    const addLoader = () => {
        let loader = document.createElement('div');
        loader.setAttribute('data-boot-loader', '');
        document.body.appendChild(loader);
    };

    test('beforeModel removes the boot skeleton', async function (assert) {
        this.owner.register('service:session', class extends Service { async setup() {} isAuthenticated = false; });
        addLoader();

        await this.owner.lookup('route:application').beforeModel({});

        assert.dom('[data-boot-loader]').doesNotExist();
    });

    test('beforeModel removes the boot skeleton when the session restore fails', async function (assert) {
        this.owner.register('service:session', class extends Service { async setup() { throw new Error('restore failed'); } });
        addLoader();

        await assert.rejects(this.owner.lookup('route:application').beforeModel({}), /restore failed/);

        assert.dom('[data-boot-loader]').doesNotExist();
    });

    test('beforeModel redirects an unauthenticated user to signin', async function (assert) {
        this.owner.register('service:session', class extends Service { async setup() {} isAuthenticated = false; });
        let transitions = [];
        this.owner.lookup('service:router').transitionTo = (route) => transitions.push(route);

        await this.owner.lookup('route:application').beforeModel({});

        assert.deepEqual(transitions, ['signin']);
    });

    test('beforeModel redirects an authenticated user to app', async function (assert) {
        this.owner.register('service:session', class extends Service { async setup() {} isAuthenticated = true; });
        let transitions = [];
        this.owner.lookup('service:router').transitionTo = (route) => transitions.push(route);

        await this.owner.lookup('route:application').beforeModel({});

        assert.deepEqual(transitions, ['app']);
    });

    test('beforeModel tolerates a missing boot skeleton', async function (assert) {
        this.owner.register('service:session', class extends Service { async setup() {} isAuthenticated = false; });

        await this.owner.lookup('route:application').beforeModel({});

        assert.dom('[data-boot-loader]').doesNotExist();
    });
});
