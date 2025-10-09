import steps from '../steps';
import { click } from '@ember/test-helpers';
export default function (assert) {
	return steps(assert).when('User clicks on add issue button in $status status', async function (status) {
		await click(`[data-add="issue-${status}"]`);
		assert.ok(true, `User clicks on add issue button in ${status} status`);
	})
	.then('There is a new issue created with $issueSubject inside lane of $status status', async function (issueSubject, status) {
		let issues = server.schema.issues.all().models;
		let recentIssue = issues[issues.length - 1];
		assert.dom(`[data-field-issue-id="${recentIssue.id}"]`).exists();
		assert.dom(`[data-field-issue-id="${recentIssue.id}"] h4`).hasText(`#${recentIssue.issueNumber} - ${issueSubject}`);
	});
}
