import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert)
        .when('User clicks on create userrole button', async function () {
            await click('[data-add="userrole"]');
            assert.ok(true, 'User clicks on create userrole button');
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
        });
}
