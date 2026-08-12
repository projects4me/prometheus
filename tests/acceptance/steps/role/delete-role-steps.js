import steps from '../steps';
import { click, currentURL } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';

export default function (assert) {
    let ctx = new Context();

    return steps(assert)
        .given('Role delete for role $roleId is locked out', function (roleId) {
            let lockoutIds = ctx.get('roleDeleteLockoutIds') || [];
            lockoutIds.push(String(roleId));
            ctx.set('roleDeleteLockoutIds', lockoutIds);
            assert.ok(true, `Role delete for role ${roleId} is locked out`);
        })
        .when('User deletes role from detail page', async function () {
            let deleteBtn = document.querySelector(
                '.role-details [data-btn="delete-role"]'
            );
            assert.ok(deleteBtn, 'Labeled Delete button on role detail exists');
            await click(deleteBtn);

            let confirmBtn = document.querySelector('[data-action="confirm"] a');
            assert.ok(confirmBtn, 'Confirm delete action exists');
            await click(confirmBtn);
            assert.ok(true, 'User deletes role from detail page');
        })
        .then('Role of id $roleId is not present inside list', async function (roleId) {
            assert.dom(`[data-role="${roleId}"]`).doesNotExist(
                `Role ${roleId} is not present inside list`
            );
        })
        .then('User is redirected to app/role', async function () {
            assert.strictEqual(
                currentURL(),
                '/app/role',
                'User is redirected to app/role'
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
