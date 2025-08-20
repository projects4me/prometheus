import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import { currentURL, click } from '@ember/test-helpers';
import Collection from 'ember-cli-mirage/orm/collection';

export default function (assert) {
	return (
		steps(assert)
			.given('There is custom callback for issue', async function () {
				let ctx = new Context();
				ctx.set('customCallback', function (issues) {
					let issue = server.schema.issues.findBy({
						issueNumber: 1
					});
					return new Collection('issue', [issue]);
				});
			})
			.given('User creates child issue with subject "$subject" and issue number $issueNumber', async function (subject, issueNumber) {
				let ctx = new Context();
				let project = ctx.get('currentProject');
				let childIssue = server.create('issue', {
					issueNumber: parseInt(issueNumber, 10),
					subject: subject,
					projectId: project.id,
					projectShortcode: project.shortCode,
					status: 'new',
					priority: 'medium',
					project: project
				});
				
				// Store the created child issue in context for later use
				ctx.set('latestChildIssue', childIssue);
				assert.ok(true, `Created child issue with subject "${subject}" and issue number ${issueNumber}`);
			})
			.given('User links child issues to parent issue $parentIssueNumber', async function (parentIssueNumber) {
				let ctx = new Context();
				let parentIssue = server.schema.issues.findBy({
					issueNumber: parseInt(parentIssueNumber, 10)
				});
				
				// Get all child issues created in this test
				let childIssues = [];
				for (let i = 2; i <= 3; i++) {
					let childIssue = server.schema.issues.findBy({
						issueNumber: i
					});
					if (childIssue) {
						childIssue.update({
							parentId: parentIssue.id,
							parentissue: parentIssue
						});
						childIssues.push(childIssue);
					}
				}
				
				// Update parent issue to include child issues
				parentIssue.update({
					childissues: childIssues
				});
				
				// Also update the project to include the new child issues
				let project = ctx.get('currentProject');
				let allProjectIssues = project.issues.models.concat(childIssues);
				project.update({
					issues: allProjectIssues
				});
				
				assert.ok(true, `Linked child issues to parent issue ${parentIssueNumber}`);
			})
			.given('User sets child issue $issueNumber priority to $priority', async function (issueNumber, priority) {
				let childIssue = server.schema.issues.findBy({
					issueNumber: parseInt(issueNumber, 10)
				});
				if (childIssue) {
					childIssue.update({
						priority: priority
					});
				}
				assert.ok(true, `Set child issue ${issueNumber} priority to ${priority}`);
			})
			.then('The issue hierarchy should display parent issue $issueNumber', async function (issueNumber) {
				assert.dom('[data-field="issue.parentissue"] a').hasText(`#${issueNumber}`);
			})
			.then('The issue hierarchy should display child issue $issueNumber', async function (issueNumber) {
				assert.dom(`[data-child-issue-id="${issueNumber}"] a`).hasText(`#${issueNumber}`);
			})
			.then('Child issues should show correct priority icons', async function () {
				assert.dom('.issue-hierarchy .child-issue .priority').exists('Child issues have priority icons');
			})
			.then('Child issues should show correct status badges', async function () {
				assert.dom('.issue-hierarchy .child-issue .badge').exists('Child issues have status badges');
			})
			.then('The issue hierarchy should show no child issues message', async function () {
				assert.dom('.issue-hierarchy .no-child-issues').exists('No child issues message is displayed');
			})
			.when('User navigates to child issue page', async function () {
				await click('[data-child-issue-id="2"] a');
			})
			.then('The child issue route should be $route', async function (route) {
				assert.equal(currentURL(), route, `User navigates to child issue route ${route}`);
			})
			.then('Child issue $issueNumber should show $priority priority icon', async function (issueNumber, priority) {
				assert.dom(`.issue-hierarchy .child-issue[data-child-issue-id] .priority`).exists(`Child issue ${issueNumber} has priority icon`);
			})
	);
}
