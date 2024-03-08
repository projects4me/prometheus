import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on create membership button": (assert) => async function () {
                await click('[data-btn="create-membership"]');
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Membership is created for system": (assert) => async function () {
                let message = document.querySelector('ul.messenger div.message-success div.messenger-message-inner').textContent;
                assert.equal(message, "Membership created for system");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}