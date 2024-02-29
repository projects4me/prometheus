import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User delete membership $membershipId": (assert) => async function (membershipId) {
                await click(`[data-role-membership-id="${membershipId}"] [data-btn="delete"]`);
                let confirmBtn = document.querySelector('[data-action="confirm"] a');
                await click(confirmBtn);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}