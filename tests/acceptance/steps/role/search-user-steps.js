import steps from '../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User search for user having userrole $userroleId": (assert) => async function (userroleId) {
                let searchEl = document.querySelector('[data-search="user"] input');
                let userrole = server.schema.userroles.find(parseInt(userroleId, 10));
                await typeIn(searchEl, userrole.user.name);
                assert.ok(true, `User search for user having userrole ${userroleId}`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There should some users exists": (assert) => async function () {
                assert.dom('[data-role="user-userroles"] tbody tr').exists();
                assert.ok(true, "There should some users exists");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
