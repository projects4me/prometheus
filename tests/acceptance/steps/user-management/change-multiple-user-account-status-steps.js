import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User update account status of all users to $accountStatus": (assert) => async function (accountStatus) {
                let massCheckBox = document.querySelector('[data-select=all]');
                let massSwitchBtn = document.querySelector('.user-mass-actions [data-input-type=switch]');

                await click(massCheckBox);

                if (accountStatus === 'inactive') {
                    document.querySelector('.user-mass-actions [data-input-type=switch]').checked = true;
                }
                await click(massSwitchBtn);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Account status of all users are set to $accountStatus": (assert) => async function (accountStatus) {
                let userStatusEls = document.querySelectorAll('tbody > tr [data-user-field="account-status"]');

                userStatusEls.forEach((userStatusEl) => {
                    assert.dom(userStatusEl).hasClass(accountStatus);
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
