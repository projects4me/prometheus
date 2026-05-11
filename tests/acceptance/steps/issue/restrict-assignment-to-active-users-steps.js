import steps from '../steps';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

function getOptionTexts() {
    return [...document.querySelectorAll('.ember-power-select-option')]
        .map((option) => option.textContent.trim());
}

export default function (assert) {
    return steps(assert)
        .given(
            'Project $projectId has invited user $invitedUserId and inactive user $inactiveUserId as members',
            async function (projectId, invitedUserId, inactiveUserId) {
                let project = server.schema.projects.find(parseInt(projectId, 10));
                let invitedUser = server.schema.users.find(parseInt(invitedUserId, 10));
                let inactiveUser = server.schema.users.find(parseInt(inactiveUserId, 10));

                invitedUser.update({ accountStatus: 'invited' });
                inactiveUser.update({ accountStatus: 'inactive' });

                let members = project.members.add(invitedUser);
                members = members.add(inactiveUser);
                project.update({ members: members });

                assert.ok(true, `Project ${projectId} has invited and inactive members`);
            }
        )
        .then(
            'User $invitedUserId and User $inactiveUserId are not listed in assignee options',
            async function (invitedUserId, inactiveUserId) {
                let invitedUser = server.schema.users.find(parseInt(invitedUserId, 10));
                let inactiveUser = server.schema.users.find(parseInt(inactiveUserId, 10));

                await clickTrigger('div[data-field="issue.assignee"] > div.input-group.select-input');
                let assigneeOptions = getOptionTexts();

                assert.notOk(
                    assigneeOptions.includes(invitedUser.name),
                    `${invitedUser.name} should not be listed in assignee options`
                );
                assert.notOk(
                    assigneeOptions.includes(inactiveUser.name),
                    `${inactiveUser.name} should not be listed in assignee options`
                );

                await click(document.body);
            }
        )
        .then(
            'User $invitedUserId and User $inactiveUserId are not listed in owner options',
            async function (invitedUserId, inactiveUserId) {
                let invitedUser = server.schema.users.find(parseInt(invitedUserId, 10));
                let inactiveUser = server.schema.users.find(parseInt(inactiveUserId, 10));

                await clickTrigger('div[data-field="issue.owner"] > div.input-group.select-input');
                let ownerOptions = getOptionTexts();

                assert.notOk(
                    ownerOptions.includes(invitedUser.name),
                    `${invitedUser.name} should not be listed in owner options`
                );
                assert.notOk(
                    ownerOptions.includes(inactiveUser.name),
                    `${inactiveUser.name} should not be listed in owner options`
                );

                await click(document.body);
            }
        );
}
