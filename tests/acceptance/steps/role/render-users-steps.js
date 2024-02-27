import steps from '../steps';
import { click } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "There are $count memberships for role $roleId": (assert, ctx) => async function (count, roleId) {
                let memberships = server.createList('membership', parseInt(count, 10));

                memberships.forEach((membership) => {
                    membership.update({
                        roleId: roleId,
                    })
                });
                assert.ok(true, `${count} memberships given to role ${roleId}`);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on user tab": (assert) => async function () {
                await click('ul.nav.nav-tabs li a[href="#users"]');
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There should $count memberships exists": (assert) => async function (count) {
                assert.dom('[data-role="user-memberships"] tbody tr').exists({ count: parseInt(count, 10) });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}