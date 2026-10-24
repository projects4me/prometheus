import steps from '../steps';
import { click, settled } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';

// The board only renders the issues of its milestones, so the card is picked by its position.
function card() {
	return '.board-issue-item';
}

export default function (assert) {
	return steps(assert)
		.given('User_1 is assignee of all issues', function () {
			server.schema.issues.all().models.forEach(issue => issue.update({ assignedTo: server.schema.users.find(1) }));
		})
		.given('User_2 is core member of project 1', function () {
			server.schema.projects.find(1).update({ members: [server.schema.users.find(2)] });
		})
		.when('There is custom callback setup for issue updating', function () {
			new Context().set('customCallback', function (issue) {
				issue.update({ assignedTo: server.schema.users.find(2) });
				return issue;
			});
		})
		.when('User clicks on the assignee avatar of the first card', async function () {
			await click(card() + ' [data-issue-assignee-toggle]');
		})
		.when('User selects User_2 from the card assignee menu of the first card', async function () {
			await click(card() + ' [data-issue-assignee-option]');
			await settled();
		})
		.then('The first card shows User_2 as assignee', function () {
			assert.dom(card() + ' [data-issue-assignee-toggle] img').hasAttribute('alt', 'User_2');
			assert.dom('.issue-details-container').doesNotExist('quick view stayed closed');
		});
}
