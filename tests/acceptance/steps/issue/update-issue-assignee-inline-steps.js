import steps from '../steps';
import { click } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';

export default function (assert) {
	return steps(assert)
        .given('User_1 is assignee of issue 4', function () {
            let issue = server.schema.issues.find(4);
            issue.update({
                assignedTo: server.schema.users.find(1)
            });
        })
		.given('User_2 is core member of project 1', function () {
            let project = server.schema.projects.find(1);
            project.update({
                members: [server.schema.users.find(2)]
            });
        })
        .when('There is custom callback setup for issue updating', function () {
            let ctx = new Context();
            ctx.set('customCallback', function (issue) {
                issue.update({
                    assignedTo: server.schema.users.find(2)
                });
                return issue;
            });
        })
        .when('User selects User_2 from assignee dropdown', async function () {
            await click('[data-issue-assignee-dropdown] li:nth-child(1) a');
        })
		.when('User clicks on assignee dropdown', async function () {
            await click('[data-issue-assignee-dropdown] [data-toggle="dropdown"]');
		})
        .then('User_2 is assigned to issue 4', function () {
            assert.dom('[data-issue-assignee]').hasText('User_2');
        });
}
