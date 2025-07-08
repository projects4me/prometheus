import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';
import EmberObject from '@ember/object';

module('Integration | Component | widgets/weekly-activities', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.owner.register('service:currentUser', CurrentUserStub);
	});

	test('it renders with basic structure', async function (assert) {
		await render(hbs`<Widgets::WeeklyActivities />`);

		assert.dom('.box').exists('Component renders with box container');
		assert.dom('.box-primary').exists('Component has primary box styling');
		assert.dom('.box-header').exists('Component has header section');
		assert.dom('.box-title').exists('Component has title section');
		assert.dom('.box-body').exists('Component has body section');
	});

	test('it renders the title correctly', async function (assert) {
		await render(hbs`<Widgets::WeeklyActivities />`);
		assert.dom('.box-title').exists('Title section is rendered');
		assert.dom('h3').exists('Title is wrapped in h3 element');
	});

	test('it renders pagination component', async function (assert) {
		await render(hbs`<Widgets::WeeklyActivities />`);

		assert
			.dom('.weekly-activities')
			.exists('Pagination container is rendered');
	});

	test('it renders date range display', async function (assert) {
		await render(hbs`<Widgets::WeeklyActivities />`);

		assert.dom('h6').exists('Date range heading is rendered');
		assert.dom('h6 b').exists('Date range is wrapped in bold element');
	});

	test('it renders timeline component', async function (assert) {
		await render(hbs`<Widgets::WeeklyActivities />`);

		// The timeline component should be rendered within the pagination
		assert.dom('.weekly-activities').exists('Timeline container exists');
	});

	test('it renders with activities data', async function (assert) {
		const mockActivities = [
			{
				relatedTo: 'issue',
                type: "updated",
				issue: EmberObject.create({ issueNumber: 123 })
			}
		];

		this.set('activities', mockActivities);
		await render(
			hbs`<Widgets::WeeklyActivities @data={{this.activities}} />`
		);

		assert.dom('.box').exists('Component renders with activities data');
		assert.dom('.box-header').exists('Header renders with activities data');
		assert.dom('.box-body').exists('Body renders with activities data');
	});

	test('it renders with widget settings', async function (assert) {
		const mockSettings = {
			options: {
				page: 1,
				limit: 10
			}
		};

		this.set('widgetSettings', mockSettings);
		await render(
			hbs`<Widgets::WeeklyActivities @widgetSettings={{this.widgetSettings}} />`
		);

		assert.dom('.box').exists('Component renders with widget settings');
		assert.dom('.box-header').exists('Header renders with widget settings');
		assert.dom('.box-body').exists('Body renders with widget settings');
	});
});
