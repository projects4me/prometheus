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
            "There will a role name $roleName in the template": (assert) => async function (roleName) {
                let role = server.schema.roles.findBy({name: roleName});
                assert.dom(`[data-role="${role.id}"] [data-role-field="name"]`).hasText(roleName);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}