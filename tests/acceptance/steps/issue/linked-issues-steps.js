import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import { currentURL, click } from '@ember/test-helpers';
import { Collection } from 'miragejs';

export default function (assert) {
	return (
		steps(assert)
			.given('There is custom callback for issue', async function () {
				let ctx = new Context();
				// The issue list does not filter in Mirage: the page issue is issue 1 and nothing is anyone's child
				ctx.set('customCallback', function (models, request) {
					if (models.modelName === 'issuelink') {
						return models;
					}
					let isChildrenQuery = /Issue\.parentId/.test(request.queryParams.query || '');
					let issues = isChildrenQuery ? [] : [server.schema.issues.findBy({ issueNumber: 1 })];
					return new Collection('issue', issues);
				});
			})
			.given('User creates linked issue with subject "$subject" and issue number $issueNumber', async function (subject, issueNumber) {
				let ctx = new Context();
				let project = ctx.get('currentProject');
				server.create('issue', {
					issueNumber: parseInt(issueNumber, 10),
					subject: subject,
					projectId: project.id,
					projectShortcode: project.shortCode,
					status: 'new',
					priority: 'medium',
					project: project,
				});
				let projectIssueIds = project.issues.models.map((issue) => issue.id);
				let created = server.schema.issues.findBy({ issueNumber: parseInt(issueNumber, 10) });
				if (!projectIssueIds.includes(created.id)) {
					project.update({ issues: project.issues.models.concat([created]) });
				}
			})
			.given('Issue $source blocks issue $target', async function (source, target) {
				let find = (number) => server.schema.issues.findBy({ issueNumber: parseInt(number, 10) });
				server.create('issuelink', { type: 'blocks', sourceIssueId: find(source).id, targetIssueId: find(target).id });
			})
			.then('The linked issues box should show no linked issues', async function () {
				assert.dom('[data-test-linked-issues-empty]').containsText('No linked issues');
			})
			.then('The linked issues should list groups $groups in that order', async function (groups) {
				let expected = groups.split(',').map((group) => group.trim());
				let shown = [...document.querySelectorAll('[data-test-linked-issues] [data-test-data-table-group], [data-test-linked-issues] [data-test-data-table-row="1"]')].map((el) =>
					el.matches('[data-test-data-table-group]') ? el.dataset.testDataTableGroup : 'current'
				);
				assert.deepEqual(shown, expected);
			})
			.then('The linked issues box should display issue $issueNumber', async function (issueNumber) {
				assert.dom(`[data-test-linked-issues] [data-test-linked-issue="${issueNumber}"] a`).hasText(`#${issueNumber}`);
			})
			.when('User opens issue $issueNumber from the linked issues box', async function (issueNumber) {
				await click(`[data-test-linked-issues] [data-test-linked-issue="${issueNumber}"] a`);
			})
			.then('The linked issue route should be $route', async function (route) {
				assert.equal(currentURL(), route);
			})
	);
}
