/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import CurrentUserStub from '../../stub-services/current-user-stub';

class AclStub extends Service {
    checkAccess() {
        return true;
    }
}

module('Integration | Component | nav-bar', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:current-user', CurrentUserStub);
        this.owner.register('service:acl', AclStub);
    });

    test('it renders', async function (assert) {
        await render(hbs`
            <AppUi::NavBar />
        `);

        assert.dom('div.user-panel').doesNotExist('the sidebar no longer repeats the user');
        assert.dom('ul.sidebar-menu > li.header').hasText('Workspace');
    });

    test('it groups the items by projectRelated and shows the project short code', async function (assert) {
        this.owner.register('service:tracked-project', class extends Service {
            shortCode = 'aprom';
            getProjectId() { return '1'; }
        });

        await render(hbs`<AppUi::NavBar />`);

        assert.dom('li.header[data-navigation-group="project"] .nav-project-code').hasText('aprom');
        assert.dom('li.nav-disabled').doesNotExist();
        assert.dom('li[data-navigation-module]').exists();
    });

    test('it disables the project items without a project', async function (assert) {
        this.owner.register('service:tracked-project', class extends Service {
            shortCode = undefined;
            getProjectId() { return undefined; }
        });

        await render(hbs`<AppUi::NavBar />`);

        assert.dom('li.header[data-navigation-group="project"] .nav-project-code').hasText('Select a project');
        assert.dom('li.nav-disabled').exists();
        assert.dom('li.nav-disabled a').hasAttribute('aria-disabled', 'true');
        assert.dom('li.nav-disabled').hasAttribute('title', 'Select a project');
        assert.dom('li.nav-disabled a[href]').doesNotExist();
    });
});
