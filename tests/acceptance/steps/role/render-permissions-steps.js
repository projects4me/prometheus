import steps from '../steps';
import { click } from '@ember/test-helpers';
import Settings from '../../../../mirage/helpers/acl-settings';

export const given = function () {
    return [
        {
            "There are $count userroles for role $roleId": (assert) => async function (count, roleId) {
                let total = parseInt(count, 10);
                let existingUsers = server.schema.users.all().models;
                let needed = Math.max(total - existingUsers.length, 0);
                if (needed > 0) {
                    server.createList('user', needed);
                }

                let users = server.schema.users.all().models;
                let userroles = server.createList('userrole', total);

                userroles.forEach((userrole, index) => {
                    let user = users[index % users.length];
                    userrole.update({
                        roleId: roleId,
                        userId: user.id,
                        user: user
                    });
                });
                assert.ok(true, `${count} userroles given to role ${roleId}`);
            }
        },
        {
            "There are catalog permissions for role $roleId": (assert) => async function (roleId) {
                let moduleActions = JSON.parse(Settings.aclSettings.moduleActions);
                moduleActions.forEach((moduleEntry) => {
                    (moduleEntry.actions || []).forEach((actionEntry) => {
                        server.create('permission', {
                            resourceName: actionEntry.resourceName,
                            roleId: String(roleId),
                            allowed: '1'
                        });
                    });
                });
                assert.ok(true, `Catalog permissions given to role ${roleId}`);
            }
        }
    ];
}

export const when = function () {
    return [];
}

export const then = function () {
    return [
        {
            "There are $permissionCount action permissions for issue module": (assert) => async function (permissionCount) {
                assert.dom('[data-role="permission-actions"] [data-permission-module="issue"] [data-module-resource]').exists({
                    count: parseInt(permissionCount, 10)
                });
            }
        },
        {
            "There are $permissionCount field permissions for issue module": (assert) => async function (permissionCount) {
                await click('[data-role="permissions"] a[href="#role-permission-fields"]');
                assert.dom('[data-role="permission-fields"] [data-permission-module="issue"] [data-module-resource]').exists({
                    count: parseInt(permissionCount, 10)
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
