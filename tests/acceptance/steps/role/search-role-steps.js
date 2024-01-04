import steps from '../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User searches for role name $role": (assert) => async function (role) {
                let searchEl = document.querySelector('[data-field="search role"]');
                await typeIn(searchEl, role);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There will a role name $role in the template": (assert) => async function (role) {
                assert.dom('[data-role-field="name"]').hasText(role);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}