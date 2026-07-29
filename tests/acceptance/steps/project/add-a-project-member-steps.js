import steps from '../steps';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "User $userId is added as a member of project $projectId": (assert) => async function (userId, projectId) {
                let user = server.schema.users.find(parseInt(userId, 10));
                let project = server.schema.projects.findBy({ shortCode: `PROJECT_${projectId}` });
                if (!project) {
                    project = server.schema.projects.find(parseInt(projectId, 10))
                        || server.create('project', {
                            id: String(projectId),
                            shortCode: `PROJECT_${projectId}`
                        });
                }

                let members = project.members.add(user);
                project.update({
                    id: String(projectId),
                    shortCode: `PROJECT_${projectId}`,
                    members: members
                });

                server.create('membership', {
                    project: project,
                    projectId: String(projectId),
                    userId: String(userId),
                    modifiedUser: parseInt(userId, 10)
                });

                assert.ok(true, `User ${userId} is added as a member of project ${projectId}`);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on add button to add a member": (assert, ctx) => async function () {
                await click('[data-add="members"]');
                assert.ok(true, "User clicks on add button to add a member");
            }
        },
        {
            "User selects $userName as a member of project": (assert, ctx) => async function (userName) {
                await selectChoose('div[data-field="select-member"] div.input-group', `${userName}`);
                assert.ok(true, `${userName} selected`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User $id is added as a member of project": (assert, ctx) => async function (id) {

                assert.dom(`[data-member-id="${id}"]`).exists();
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
