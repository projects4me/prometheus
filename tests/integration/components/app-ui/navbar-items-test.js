import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/navbar-items', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders', async function (assert) {
		let metadata = {
			module1: {
				label: 'views.nav.menu.project.label',
				icon: 'briefcase',
				route: 'app.projectsList',
				anchorRoute: 'project',
				projectRelated: false,
				actions: {
					section1: {
						list: {
							label: 'views.nav.menu.project.list',
							route: 'app.projects',
							className: 'text-teal',
							anchorRoute: 'project',
							projectRelated: false
						},
						create: {
							label: 'views.nav.menu.project.create',
							route: 'app.projects.create',
							className: 'text-red',
							anchorRoute: 'project/create',
							projectRelated: false
						}
					}
				}
			},
			module2: {
				label: 'views.nav.menu.dashboard.label',
				icon: 'dashboard',
				route: 'app',
				anchorRoute: '',
				routeParams: null,
				projectRelated: false
			}
		};

		let trackedProject = {
			shortCode: 'test'
		};

		this.set('metadata', metadata);
		this.set('trackedProject', trackedProject);
		this.set('navigate', () => {});

		await render(hbs`
        <ul class="sidebar-menu">
            <AppUi::NavbarItems
                @meta={{this.metadata}}
                @appPrefix="api"
                @trackedProject={{this.trackedProject}} 
                @navigate={{this.navigate}}   
            />
        </ul>
        `);

		assert.dom('[data-navigation-module="module1"]').exists();
		assert
			.dom('[data-navigation-module="module1"] ul.treeview-menu li')
			.exists({
				count: 2
			});

		assert.dom('[data-navigation-module="module2"]').exists();
	});

	test('it scopes sub-items by workspaceRelated and projectRelated', async function (assert) {
		this.set('metadata', {
			Workspace: {
				label: 'views.nav.menu.workspace.label',
				icon: 'cubes',
				route: 'app.workspace',
				anchorRoute: 'workspace',
				projectRelated: true,
				workspaceRelated: true,
				actions: {
					section1: {
						overview: { label: 'views.nav.menu.workspace.overview', route: 'app.workspace', anchorRoute: 'workspace', workspaceRelated: true },
						agents: { label: 'views.nav.menu.workspace.agents', route: 'app.agent', anchorRoute: 'agent' },
						issues: { label: 'views.nav.menu.issue.list', route: 'app.project.issue', anchorRoute: 'issue', projectRelated: true }
					}
				}
			}
		});
		this.set('trackedProject', { shortCode: 'aprom', workspaceShortCode: 'agw' });
		this.set('navigate', () => {});

		await render(hbs`
        <ul class="sidebar-menu">
            <AppUi::NavbarItems @meta={{this.metadata}} @appPrefix="app" @trackedProject={{this.trackedProject}} @navigate={{this.navigate}} />
        </ul>
        `);

		assert.dom('[data-navigation-action="overview"] a').hasAttribute('href', '/app/workspace/agw');
		assert.dom('[data-navigation-action="agents"] a').hasAttribute('href', '/app/agent');
		assert.dom('[data-navigation-action="issues"] a').hasAttribute('href', '/app/project/aprom/issue');
	});

	test('it passes the clicked item to navigate', async function (assert) {
		let overview = { label: 'views.nav.menu.workspace.overview', route: 'app.workspace', anchorRoute: 'workspace', workspaceRelated: true };
		this.set('metadata', {
			Workspace: { label: 'views.nav.menu.workspace.label', icon: 'cubes', route: 'app.workspace', anchorRoute: 'workspace', workspaceRelated: true, actions: { section1: { overview } } }
		});
		this.set('trackedProject', { shortCode: 'aprom', workspaceShortCode: 'agw' });
		this.set('navigate', (item) => assert.step(item.route));

		await render(hbs`
        <ul class="sidebar-menu">
            <AppUi::NavbarItems @meta={{this.metadata}} @appPrefix="app" @trackedProject={{this.trackedProject}} @navigate={{this.navigate}} />
        </ul>
        `);
		await click('[data-navigation-action="overview"] a');

		assert.verifySteps(['app.workspace']);
	});

	test('it disables a workspace item until the workspace is known', async function (assert) {
		this.set('metadata', {
			Workspace: { label: 'views.nav.menu.workspace.label', icon: 'cubes', route: 'app.workspace', anchorRoute: 'workspace', projectRelated: true, workspaceRelated: true }
		});
		this.set('trackedProject', { shortCode: 'aprom', workspaceShortCode: undefined });
		this.set('navigate', () => {});

		await render(hbs`
        <ul class="sidebar-menu">
            <AppUi::NavbarItems @meta={{this.metadata}} @appPrefix="app" @trackedProject={{this.trackedProject}} @navigate={{this.navigate}} />
        </ul>
        `);

		assert.dom('li.nav-disabled[data-navigation-module="Workspace"]').exists();
	});
});
