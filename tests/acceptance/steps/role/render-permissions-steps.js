import steps from '../steps';
import { click } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "There are $count permissions for role $roleId": (assert) => async function (count, roleId) {
                let permissions = server.createList('permission', parseInt(count));
                permissions.forEach((permission) => {
                    permission.update({
                        roleId: roleId
                    })
                });
                assert.ok(true, `${count} permissions given to role ${roleId}`);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on first module to check permissions": (assert) => async function () {
                // here we're clicking on Issue module because we have only 1 resource for permission in its factory.
                await click('[data-permission-module="Issue"] a');
                assert.ok(true, 'First module accordion opened');
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There are $permissionCount permissions for that module": (assert) => async function (permissionCount) {
                debugger;
                assert.dom('[data-permission-module="Issue"] tbody tr').exists({ count: parseInt(permissionCount) });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}