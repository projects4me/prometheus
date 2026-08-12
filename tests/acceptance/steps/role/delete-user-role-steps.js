import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert)
        .when('User delete userrole $userroleId', async function (userroleId) {
            await click(`[data-role-userrole-id="${userroleId}"] [data-btn="delete"]`);
            let confirmBtn = document.querySelector('[data-action="confirm"] a');
            await click(confirmBtn);
            assert.ok(true, `User delete userrole ${userroleId}`);
        })
        .then('There should $count userroles exists', async function (count) {
            assert.dom('[data-role="user-userroles"] li[data-role-userrole-id]').exists({
                count: parseInt(count, 10)
            });
        });
}
