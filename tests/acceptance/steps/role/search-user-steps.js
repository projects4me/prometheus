import steps from '../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User search for user having membership $membershipId": (assert) => async function (membershipId) {
                let searchEl = document.querySelector('[data-search="user"] input');
                let membership = server.schema.memberships.find(parseInt(membershipId, 10));
                await typeIn(searchEl, membership.user.name);
                assert.ok(true, `User search for user having membership ${membershipId}`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There should some users exists": (assert) => async function () {
                assert.dom('[data-role="user-memberships"] tbody tr').exists();
                assert.ok(true, "There should some users exists");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}