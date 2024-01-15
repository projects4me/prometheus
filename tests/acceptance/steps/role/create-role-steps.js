import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on role create button": (assert) => async function () {
                await click('[data-btn="role-add"]');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}