/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | application-header', function (hooks) {
    setupRenderingTest(hooks);

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
    });

    test('it renders component with logged in user name and created date of that user', async function (assert) {
        this.owner.register('service:current-user', CurrentUserStub);

        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);

        assert.dom('header li.dropdown.user.user-menu span#user-name').hasText('Rana Nouman', 'current username matched');
        assert.dom('li.user-header p > small').hasText('Member since Feb 2022', 'date created matched');
    });
});