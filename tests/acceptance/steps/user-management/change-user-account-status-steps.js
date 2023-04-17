import steps from '../steps';
import { click } from '@ember/test-helpers';

export const given = function () {
    return [
        {
            "User $userId account status is $accountStatus": (assert) => async function (userId, accountStatus) {
                let user = server.schema.users.find(parseInt(userId));
                user.update({
                    accountStatus: accountStatus
                });

                assert.ok(true);
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User change account status of User $userId": (assert) => async function (userId) {
                let switchEl = document.querySelector(`tr[data-user-id="${userId}"] label.switch-control input[type="checkbox"]`);

                await click(switchEl);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User $userId account status is changed to $accountStatus": (assert) => async function (userId, accountStatus) {
                let user = server.schema.users.find(parseInt(userId));

                assert.equal(user.accountStatus, accountStatus, `User ${userId} account status is ${accountStatus}`);
            }
        }
    ];
}


export default function (assert) {
    return steps(assert);
}