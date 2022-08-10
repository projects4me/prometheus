import steps from '../steps';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "Project membership is given to $userCount users": (assert, ctx) => async function (userCount) {
                let users = server.schema.users.all();
                let currentProject = ctx.get('currentProject');

                users.models.forEach((user) => {
                    let membership = server.create('membership');
                    membership.update({
                        userId: user.id,
                        roleId: '1',
                        projectId: currentProject.id
                    });
                });

                let project = ctx.get('currentProject');
                project.update({
                    memberships: server.schema.memberships.all()
                });

                assert.ok(true, `Project membership is given ${userCount} users`);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on add button to add a member": (assert, ctx) => async function () {
                await click('div.membership-add');
                assert.ok(true, "User clicks on add button to add a member");
            }
        },
        {
            "User selects $userName as a member of project": (assert, ctx) => async function (userName) {
                await selectChoose('div[data-field="select-member"] div.input-group', `${userName}`);
                assert.ok(true, `${userName} selected`);
            }
        },
        {
            "User selects a role for that member": (assert, ctx) => async function () {
                await selectChoose('div[data-field="select-role"] div.input-group', '.ember-power-select-option', 1);
                assert.ok(true, `role selected`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "$userName is added as a member of project": (assert, ctx) => async function (userName) {
                assert.dom('ul.users-list li:nth-last-child(2) a').hasText(userName);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}