/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickTrigger, typeInSearch } from 'ember-power-select/test-support/helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | application-header', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function(assert) {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it renders component with the sign out button', async function (assert) {
        let session = {
            isAuthenticated: true
        };
        this.set('session', session);

        await render(hbs`
            <AppLayouts::ApplicationHeader
                @session={{this.session}}    
            />
        `);

        assert.dom('div#btn-signout > a').hasText('Sign Out', 'signout button exists');
    });

    test('it renders component with the sign in button', async function (assert) {
        let session = {
            isAuthenticated: false
        };
        this.set('session', session);

        await render(hbs`
            <AppLayouts::ApplicationHeader
                @session={{this.session}}    
            />
        `);

        assert.dom('div#btn-signin > a').hasText('Sign In', 'signin button exists');
        assert.dom('div#btn-signin > a').hasAttribute('aria-disabled', 'true');
        assert.dom('div#btn-signin > a').hasClass('disabled');
    });

    test('it renders component with logged in user name and created date of that user', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        assert.dom('header li.dropdown.user.user-menu span#user-name').hasText('Rana Nouman', 'current username matched');
        assert.dom('li.user-header p > small').hasText('Member since Feb 2022', 'date created matched');
    });
    test('it renders module icons before the quick create entries', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        const links = this.element.querySelectorAll('.create-module-dropdown-content a');
        assert.strictEqual(links.length, 3, 'three entries');
        ['fa-tasks', 'fa-comments', 'fa-briefcase'].forEach((icon, idx) => {
            assert.ok(links[idx].firstElementChild.classList.contains(icon), `${icon} is the first child`);
        });
    });
});
module('Integration | Component | application-header search task', function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', CurrentUserStub);
    });

    test('typing twice within the debounce sends one search request for the second query', async function (assert) {
        const queries = [];
        this.server.get('/issue', (schema, request) => {
            queries.push(request.queryParams.query || '');
            return {
                data: [{ id: '1', type: 'issue', attributes: { subject: 'beta two', issueNumber: 2, status: 'new' } }],
                meta: { count: 1 }
            };
        });

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await clickTrigger('.global-search');
        const first = typeInSearch('alp');
        const second = typeInSearch('beta');
        await Promise.all([first, second]);
        await settled();

        const searches = queries.filter((q) => q.includes('CONTAINS'));
        assert.strictEqual(searches.length, 1, 'exactly one search request');
        assert.ok(searches[0].includes('beta'), 'the request is for the second query');
        assert.ok(!searches[0].includes('alp'), 'the first query was cancelled');
    });
});
