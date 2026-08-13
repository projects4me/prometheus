import steps from '../steps';
import { click } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';

export default function (assert) {
    return steps(assert)
        .when('User clicks on create userrole button', async function () {
            await click('[data-add="userrole"]');
            assert.ok(true, 'User clicks on create userrole button');
        })
        .when('User selects $userName as a role member', async function (userName) {
            await selectChoose('div[data-field="userrole.user"] div.input-group', `${userName}`);
            assert.ok(true, `${userName} selected as role member`);
        })
        .then('There should $count userroles exists', async function (count) {
            assert.dom('[data-role="user-userroles"] li[data-role-userrole-id]').exists({
                count: parseInt(count, 10)
            });
        })
        .then('View All members control should be visible', async function () {
            assert.dom('[data-btn="view-all-members"]').exists({ count: 1 });
        })
        .then('Userrole is created for user', function () {
            let message = document.querySelector('ul.messenger div.message-success div.messenger-message-inner').textContent;
            assert.ok(message.includes('Role assigned'), 'Userrole success message shown');
        })
        .then('$userName is assigned to role', async function (userName) {
            assert.dom('[data-role="user-userroles"]').includesText(userName);
        })
        .then('Add role member picker should offer $count users', async function (count) {
            await clickTrigger('div[data-field="userrole.user"] div.input-group');
            assert.dom('.ember-power-select-options .ember-power-select-option').exists({
                count: parseInt(count, 10)
            });
        })
        .then('Add role member picker should show no eligible users', async function () {
            assert.dom('[data-role="add-userrole-empty"]').exists();
            assert.dom('div[data-field="userrole.user"]').doesNotExist();
        });
}
