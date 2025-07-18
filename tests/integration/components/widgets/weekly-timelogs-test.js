import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | widgets/weekly-issue-timelogs', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function (assert) {
		this.owner.register('service:current-user', CurrentUserStub);
		assert.ok(
			this.owner.lookup('service:current-user'),
			'Current user service is registered'
		);
	});

	test('it renders with data', async function (assert) {
		let timelog = EmberObject.create({
			context: 'spent',
			days: 0,
			hours: 2,
			minutes: 30,
		});
		let timelogs = A([timelog]);		

		let issue = EmberObject.create({
			issueNumber: 42,
			subject: 'Test Issue',
			status: 'open',
			get(key) {
				return this[key];
			},
			projectShortcode: 'PRJ',
			spent: timelogs,
			estimated: timelogs
		});
		let issues = A([issue]);

		this.set('widgetSettings', {
			useLazyLoading: true,
			showSearch: true,
			pageSize: 10,
			usePagination: true,
			searchFields: ['subject'],
			fields: [
				'issueNumber',
				'subject',
				'spent',
				'estimated',
				'status',
				'project'
			],
			filters: ['myTimeLogs']
		});

		this.set('issues', issues);
		await render(
			hbs`<Widgets::WeeklyIssueTimelogs @data={{this.issues}} @widgetSettings={{this.widgetSettings}} />`
		);
		assert.dom('.weekly-timelogs').exists('Table container is rendered');
		assert.dom('tr').exists('A table row is rendered');
		assert.dom('td').exists('A table cell is rendered');
		assert.dom('.timelogs-summary').exists('Summary row is rendered');
	});
});
