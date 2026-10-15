/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | settings/nav', function (hooks) {
    setupRenderingTest(hooks);

    const groups = [{
        key: 'access',
        label: 'views.nav.menu.settings.group.access',
        items: [
            { key: 'users', route: 'app.settings.users', icon: 'users', label: 'views.nav.menu.user.label' },
            { key: 'roles', route: 'app.role', icon: 'key', label: 'views.nav.menu.role.label' }
        ]
    }];

    test('it renders the groups and their pages', async function (assert) {
        this.set('groups', groups);

        await render(hbs`<Settings::Nav @groups={{this.groups}} />`);

        assert.dom('.box.box-primary.settings-nav').exists();
        assert.dom('.settings-nav__group').exists({ count: 1 });
        assert.dom('.nav.nav-pills.nav-stacked li').exists({ count: 2 });
        assert.dom('[data-settings-item="users"] i').hasClass('fa-users');
    });

    test('it highlights the active page', async function (assert) {
        this.set('groups', groups);
        this.owner.register('service:router', class extends Service {
            currentRouteName = 'app.settings.users';
            urlFor() { return '#'; }
            isActive() { return false; }
            on() {}
            off() {}
        });

        await render(hbs`<Settings::Nav @groups={{this.groups}} />`);

        assert.dom('[data-settings-item="users"]').hasClass('active');
        assert.dom('[data-settings-item="roles"]').doesNotHaveClass('active');
    });

    test('it lists only the pages the user may access', async function (assert) {
        this.owner.register('service:acl', class extends Service {
            checkAccess(context) { return context !== 'role.read'; }
        });

        await render(hbs`<Settings::Nav />`);

        assert.dom('[data-settings-item="users"]').exists();
        assert.dom('[data-settings-item="roles"]').doesNotExist();
    });
});
