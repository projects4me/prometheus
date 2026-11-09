import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User selects role $roleIndex": (assert) => async function (roleIndex) {
                await click(`[data-role-browser] [data-role="${roleIndex}"]`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}