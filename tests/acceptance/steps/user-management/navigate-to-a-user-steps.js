import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on user having id $userId": (assert) => async function (userId) {
                let userEl = document.querySelector(`[data-user-id="${userId}"] [data-user-field="profile"] a`);
                await click(userEl);
            }
        },
    ];
}


export default function (assert) {
    return steps(assert);
}