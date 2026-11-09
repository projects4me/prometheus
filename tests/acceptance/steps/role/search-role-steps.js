import steps from '../steps';
import { fillIn, focus, settled } from '@ember/test-helpers';
import { runSearch } from '../ez-search-run';

export const when = function () {
    return [
        {
            "User searches for role name $role": (assert) => async function (role) {
                let input = '[data-role-browser] [data-field="ez-search-input"] input, [data-role-browser] input[data-field="ez-search-input"]';
                await focus(input);
                await fillIn(input, `name ~ ${role}`);
                await runSearch(input);
                await settled();
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