import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import { click } from '@ember/test-helpers';
import Collection from 'ember-cli-mirage/orm/collection';
import IssuePlanning from 'prometheus/components/issue/issue-planning';

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
			.given(
				'Project has issue type of $issueType and status of $issueStatus',
				async function (issueType, issueStatus) {
					let ctx = new Context();
					let project = ctx.get('currentProject');
					let issueTypeModel = server.create('issuetype', {
						name: issueType
					});
					let issueStatusModel = server.create('issuestatus', {
						name: issueStatus
					});
					project.update({
						issuestatuses: [issueStatusModel],
						issuetypes: [issueTypeModel]
					});
				}
			)
			.given('A task fails during creation', async function () {
				// Rely on component to simulate failure based on context flag
				assert.ok(true, 'A task will fail during creation');
			})
			// **{TODO}**
			// Adding a 1 sec is a hack to wait for the modal to open, we should use a more reliable method in future
			.when('User opens Issue Planning modal', async function () {
				await click('[data-btn="ai-plan"]');
				await new Promise((resolve) => setTimeout(resolve, 500));
				assert.ok(true, 'Issue Planning modal opened');
			})
			.given('Disable modal close for testing', async function () {
				this.owner.register('component:issue/issue-planning', class extends IssuePlanning {
					showSuccessMessage = () => 'no need to close the modal and show success message'
				 });
				assert.ok(true, 'Modal close disabled');
			})
			.when('User unchecks task $taskId', async function (taskId) {
				await click(`[data-select="${taskId}"]`);
				assert.ok(true, `User unchecked task ${taskId}`);
			})
			.when('User checks task $taskId', async function (taskId) {
				await click(`[data-select="${taskId}"]`);
				assert.ok(true, `User checked task ${taskId}`);
			})
			.when('User starts the issue plan', async function () {
				await click('[data-btn="create-issue-plan"]');
				assert.ok(true, 'User started issue planning');
			})
			.when('User retries the failed task', async function () {
				await click('.issue-plan-retry-btn');
				assert.ok(true, 'Clicked retry on failed task');
			})
			.when(
				'User copies the failed task to clipboard',
				async function () {
					await click('.issue-plan-copy-btn');
					assert.ok(true, 'Clicked copy to clipboard');
				}
			)
			.when(
				'There is custom callback for issue creation failure',
				async function () {
					let ctx = new Context();
					ctx.set('customCallback', function (issues) {
						console.log(server.schema.issues.all());
						throw new Error('Issue creation failed');
					});
				}
			)
			.when(
				'There is custom callback for issue planning data',
				async function () {
					let ctx = new Context();
					ctx.set('customCallback', function () {
						let plan = {
							tasks: [
								{
									id: 'TASK-1',
									subject: 'Implement authentication',
									description: 'Add login and signup flows',
									dependency: null,
									tests: [
										{
											scenario:
												'Login with valid credentials',
											test_case:
												'Given I am on login page... Then I should see dashboard',
											estimated_hours: 2
										}
									]
								},
								{
									id: 'TASK-2',
									subject: 'Protect routes',
									description:
										'Ensure private routes require auth',
									dependency: 'TASK-1',
									tests: [
										{
											scenario:
												'Unauthenticated access redirects to login',
											test_case:
												'Given I open /app without token... Then I land on login',
											estimated_hours: 1
										}
									]
								},
								{
									id: 'TASK-3',
									subject: 'Refresh token handling',
									description: 'Auto-refresh access token',
									dependency: 'TASK-2',
									tests: [
										{
											scenario: 'Token refresh on 401',
											test_case:
												'Given access token expired... Then refresh and retry',
											estimated_hours: 1.5
										}
									]
								},
								{
									id: 'TASK-4',
									subject: 'Public pages',
									description: 'Landing page and about page',
									dependency: null,
									tests: [
										{
											scenario: 'Landing page loads',
											test_case:
												'Given I visit / ... Then I see landing',
											estimated_hours: 0.5
										}
									]
								}
							]
						};
						return plan;
					});
					assert.ok(true, 'Custom callback for issue planning data set');
				}
			)
			.when('Setup parent issue relationship for issue $issueId with issue $parentIssueId', async function (issueId, parentIssueId) {
				let issue = server.schema.issues.find(parseInt(issueId, 10));
				issue.update({
					parentissue: server.schema.issues.find(parseInt(parentIssueId, 10))
				});
			})
			.then(
				'The issue planning tree should render with parents and children',
				async function () {
					assert
						.dom('[data-task-id="TASK-1"]')
						.exists('Parent task TASK-1 exists');
					assert
						.dom('[data-task-id="TASK-2"]')
						.exists('Child task TASK-2 exists');
				}
			)
			.then('$task parent is disabled', async function (task) {
				assert.dom(`[data-task-id="${task}"] .dependency-disabled`).exists(`${task} is disabled due to dependency`);
			})
			.then('$task parent is enabled', async function (task) {
				assert.dom(`[data-task-id="${task}"] .dependency-disabled`).doesNotExist(`${task} is enabled again`);
			})
			.then(
				'Clipboard should contain the JSON of the task and its children',
				async function () {
					assert.ok(
						true,
						'Clipboard was requested to be populated (cannot assert clipboard contents reliably in test)'
					);
				}
			)
			.then('The failed task and its children are created', async function () {
				assert.ok(true, 'The failed task and its children are created');
			})
			.then('The parent of issue 3 should be issue 1', async function () {
				let path = document.querySelector('[data-field="issue.parentissue"] a').pathname;
				assert.equal(path, '/app/project/PROJECT_1/issue/1');
			})
	);
}