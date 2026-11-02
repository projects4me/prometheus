/* global server */
import steps from '../steps';
import agentFixtureSteps from '../agents/agent-fixtures';

export default function (assert) {
	return agentFixtureSteps(steps(assert))
		.given('Agent "$name" is assignee of issue 4 and has commented and logged time on it', function (name) {
			let agent = server.schema.agents.findBy({ name });
			let userId = agent.userId;
			let comment = server.create('comment', { createdUser: userId, relatedTo: 'issues', relatedId: '4', comment: 'Ready for review' });
			comment.update({ createdUserName: name });
			let timelog = server.create('timelog', { createdUser: userId, createdUserName: name });
			server.schema.issues.find(4).update({
				assignedTo: server.schema.users.find(userId),
				comments: [comment],
				spent: [timelog]
			});
		})
		.given('User_1 is assignee of issue 4', function () {
			server.schema.issues.find(4).update({ assignedTo: server.schema.users.find(1) });
		})
		.then('The issue header shows the robot avatar for the assignee', function () {
			assert.dom('[data-field="issue.assignee"] [data-agent-avatar]').exists('robot avatar in the header');
		})
		.then('The Members box shows the AGENT label for the assignee', function () {
			assert.dom('ul.users-list li:first-child [data-agent-badge]').exists('AGENT label in the Members box');
			assert.dom('ul.users-list li:first-child [data-agent-avatar]').exists('robot avatar in the Members box');
		})
		.then('The thread comment of "$name" shows the AGENT label and "$sponsor"', function (name, sponsor) {
			assert.dom('.box-comment [data-agent-avatar]').exists('robot avatar on the comment');
			assert.dom('.box-comment [data-agent-badge]').exists('AGENT label on the comment');
			assert.dom('.box-comment [data-agent-sponsor]').hasText(sponsor);
		})
		.then('The time log of "$name" shows the AGENT label', function () {
			assert.dom('[data-issue-spent-id] [data-agent-badge]').exists('AGENT label on the time log');
			assert.dom('[data-issue-spent-id] [data-agent-avatar]').exists('robot avatar on the time log');
		})
		.then('The issue shows no agent marks', function () {
			assert.dom('.users-list [data-agent-badge]').doesNotExist('no AGENT label for a human');
			assert.dom('[data-field="issue.assignee"] [data-agent-avatar]').doesNotExist('no robot avatar for a human');
		});
}
