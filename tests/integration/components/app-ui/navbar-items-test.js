import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
});
