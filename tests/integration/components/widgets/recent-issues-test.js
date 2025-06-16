import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | widgets/recent-issues', function (hooks) {
	setupRenderingTest(hooks);
	setupMirage(hooks);

	hooks.beforeEach(function (assert) {
		this.owner.register('service:current-user', CurrentUserStub);
	});

	test('it renders', async function (assert) {
        this.server.db.emptyData();
		let issues = this.server.createList('issue', 3);
		let project = this.server.create('project');
		let metadata = {
            fields: ['issueNumber', 'subject', 'status', {label: 'project', valueKey: 'project.name'}, 'startDate', 'endDate'],
            translationKey: 'views.app.issue.fields',
            searchFields: ['issueNumber', 'subject', 'project.name']
		};

		const statusMap = {
            "new": "New",
            "in_progress": "In Progress",
            "pending": "Pending",
            "done": "Done",
            "wont_fix": "Won't Fix",
            "deferred": "Deferred ",
            "feedback": "Feedback"
		};

		issues.forEach((issue) => {
			issue.project = project;
		});

		this.set('issues', issues);
		this.set('metadata', metadata);
		this.set('statusMap', statusMap);

		await render(hbs`
            <Widgets::RecentIssues 
                @data={{this.issues}} 
                @widgetSettings={{this.metadata}}
            />
        `);

		assert.dom('[data-recent-issues-table]').exists('Table exists');
		assert
			.dom('[data-recent-issues-table] tbody tr')
			.exists({ count: 3 }, 'Has 3 issue rows');
		issues.forEach((issue, index) => {
			const row = `[data-recent-issues-table] tbody tr:nth-child(${
				index + 1
			})`;
			assert
				.dom(`${row} td:nth-child(1)`)
				.hasText(`#${issue.issueNumber}`, `Row ${index + 1} has correct issue number`);
			assert
				.dom(`${row} td:nth-child(2)`)
				.hasText(
					issue.subject,
					`Row ${index + 1} has correct subject`
				);
			assert
				.dom(`${row} td:nth-child(3) span.badge`)
				.hasText(
					statusMap[issue.status],
					`Row ${index + 1} has correct status`
				);
			assert
				.dom(`${row} td:nth-child(4)`)
				.hasText(
					project.name,
					`Row ${index + 1} has correct project name`
				);
			assert
				.dom(`${row} td:nth-child(5)`)
				.hasText(moment(issue.startDate).format("DD MMM 'YY"), `Row ${index + 1} has correct start date`);
			assert
				.dom(`${row} td:nth-child(6)`)
				.hasText(
					moment(issue.endDate).format("DD MMM 'YY"),
					`Row ${index + 1} has correct end date`
				);
		});
	});
});
