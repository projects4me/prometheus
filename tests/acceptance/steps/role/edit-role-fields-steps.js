import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User selects role $roleIndex": (assert) => async function (roleIndex) {
                let roles = document.querySelectorAll('.role-card');
                let roleCardEl = roles[roleIndex - 1];
                await click(roleCardEl);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}