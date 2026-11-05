/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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