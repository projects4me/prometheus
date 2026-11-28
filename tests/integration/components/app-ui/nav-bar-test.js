/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
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
        assert.dom('ul.sidebar-menu > li.header').hasText('Home');
    });

    test('it groups the items by projectRelated and shows the project short code', async function (assert) {
        this.owner.register('service:tracked-project', class extends Service {
            shortCode = 'aprom';
            workspaceShortCode = 'agw';
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

    test('the Projects item opens All projects and Workspaces', async function (assert) {
        await render(hbs`<AppUi::NavBar />`);

        let actions = '[data-navigation-module="Project"] ul.treeview-menu li[data-navigation-action]';
        assert.dom(actions).exists({ count: 2 });
        assert.dom('[data-navigation-module="Project"] [data-navigation-action="all"] a').hasText('All projects');
        assert.dom('[data-navigation-module="Project"] [data-navigation-action="all"] a').hasAttribute('href', /\/project$/);
        assert.dom('[data-navigation-module="Project"] [data-navigation-action="workspaces"] a').hasText('Workspaces');
        assert.dom('[data-navigation-module="Project"] [data-navigation-action="workspaces"] a').hasAttribute('href', /\/workspace$/);
    });

    test('the Workspace item is one link, last in the Project group, to the workspace Overview of the project', async function (assert) {
        this.owner.register('service:tracked-project', class extends Service {
            shortCode = 'aprom';
            workspaceShortCode = 'agw';
            getProjectId() { return '1'; }
        });

        await render(hbs`<AppUi::NavBar />`);

        let modules = [...this.element.querySelectorAll('li[data-navigation-module]')].map((li) => li.dataset.navigationModule);
        assert.ok(modules.indexOf('Workspace') > modules.indexOf('Idea'), 'Workspace follows the project items');
        assert.ok(modules.indexOf('Workspace') < modules.indexOf('Settings'), 'Workspace comes before the Admin items');

        assert.dom('[data-navigation-module="Workspace"] li[data-navigation-action]').doesNotExist();
        assert.dom('[data-navigation-module="Workspace"] ul.treeview-menu').doesNotExist();
        assert.dom('[data-navigation-module="Workspace"] > a').hasText('Workspace').hasAttribute('href', /\/workspace\/agw$/);
    });

    test('the Workspace item is disabled without a project', async function (assert) {
        this.owner.register('service:tracked-project', class extends Service {
            shortCode = undefined;
            workspaceShortCode = undefined;
            getProjectId() { return undefined; }
        });

        await render(hbs`<AppUi::NavBar />`);

        assert.dom('li.nav-disabled[data-navigation-module="Workspace"]').exists();
        assert.dom('[data-navigation-module="Workspace"] a[href]').doesNotExist();
    });

    test('the Admin group shows only Settings and Developer', async function (assert) {
        await render(hbs`<AppUi::NavBar />`);

        assert.dom('li[data-navigation-module="Workflows"]').doesNotExist();
        assert.dom('li[data-navigation-module="Agents"]').doesNotExist();
        assert.dom('li[data-navigation-module="Settings"]').exists();
        assert.dom('li[data-navigation-module="Developer"]').exists();
    });

    module('treeview submenus', function (hooks) {
        hooks.beforeEach(function () {
            this.owner.register('service:tracked-project', class extends Service {
                shortCode = 'aprom';
                workspaceShortCode = 'agw';
                getProjectId() { return '1'; }
            });
            this.mini = false;
            let context = this;
            this.owner.register('service:sidebar', class extends Service {
                get isMini() { return context.mini; }
                close = () => {};
            });
        });

        const project = '[data-navigation-module="Project"]';
        const issue = '[data-navigation-module="Issue"]';

        test('a click opens a submenu and a second click closes it', async function (assert) {
            await render(hbs`<AppUi::NavBar />`);
            assert.dom(project).doesNotHaveClass('menu-open');

            await click(`${project} > a`);
            assert.dom(project).hasClass('menu-open');

            await click(`${project} > a`);
            assert.dom(project).doesNotHaveClass('menu-open');
        });

        test('one submenu is open at a time across the groups', async function (assert) {
            await render(hbs`<AppUi::NavBar />`);

            await click(`${project} > a`);
            await click(`${issue} > a`);

            assert.dom(issue).hasClass('menu-open');
            assert.dom(project).doesNotHaveClass('menu-open');
        });

        test('nothing happens while the sidebar is collapsed to its icon strip', async function (assert) {
            this.mini = true;
            await render(hbs`<AppUi::NavBar />`);

            await click(`${project} > a`);

            assert.dom(project).doesNotHaveClass('menu-open');
        });
    });
});
