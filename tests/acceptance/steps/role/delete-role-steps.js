import steps from '../steps';
import { click } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';

export const when = function () {
    return [
        {
            'User deletes role from detail page': (assert) => async function () {
                let deleteBtn = document.querySelector('.role-details [data-role="role-record"] .box-tools [data-btn="delete-role"]');
                assert.ok(deleteBtn, 'Delete button in the Role box header exists');
                await click(deleteBtn);

                let confirmBtn = document.querySelector('[data-action="confirm"] a');
                assert.ok(confirmBtn, 'Confirm delete action exists');
                await click(confirmBtn);
                assert.ok(true, 'User deletes role from detail page');
            }
        }
    ];
};

export default function (assert) {
    let ctx = new Context();

    return steps(assert)
        .given('Role delete for role $roleId is locked out', function (roleId) {
            let lockoutIds = ctx.get('roleDeleteLockoutIds') || [];
            lockoutIds.push(String(roleId));
            ctx.set('roleDeleteLockoutIds', lockoutIds);
            assert.ok(true, `Role delete for role ${roleId} is locked out`);
        })
        .then('The Permissions box has no delete button', async function () {
            assert.notOk(document.querySelector('[data-role="role-permissions"] [data-btn="delete-role"]'), 'Permissions box has no delete button');
        })
        .then('Role of id $roleId is not present inside list', async function (roleId) {
            assert.dom(`[data-role="${roleId}"]`).doesNotExist(
                `Role ${roleId} is not present inside list`
            );
        })
        .then('Role delete lockout error is shown', async function () {
            let messageEl = document.querySelector(
                'ul.messenger div.message-error div.messenger-message-inner'
            );
            assert.ok(messageEl, 'Error messenger exists');
            assert.ok(
                messageEl.textContent.includes('cannot be deleted')
                    || messageEl.textContent.includes('suggestion')
                    || messageEl.textContent.includes('Grant full permission'),
                `Lockout error message is shown: ${messageEl.textContent}`
            );
        });
}
