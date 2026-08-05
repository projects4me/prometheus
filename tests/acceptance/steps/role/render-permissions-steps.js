import steps from '../steps';
import { click } from '@ember/test-helpers';
import Settings from '../../../../mirage/helpers/acl-settings';

export const given = function () {
    return [
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
    return [
        {
            "User clicks on first module to check permissions": (assert) => async function () {
                await click('[data-permission-module="issue"] a');
                assert.ok(true, 'Issue module accordion opened');
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There are $permissionCount action permissions for that module": (assert) => async function (permissionCount) {
                assert.dom('[data-permission-module="issue"] #issue-actions tbody tr').exists({ count: parseInt(permissionCount, 10) });
            }
        },
        {
            "There are $permissionCount field permissions for that module": (assert) => async function (permissionCount) {
                await click('[data-permission-module="issue"] a[href="#issue-fields"]');
                assert.dom('[data-permission-module="issue"] #issue-fields tbody tr').exists({ count: parseInt(permissionCount, 10) });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
