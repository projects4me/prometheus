import steps from '../steps';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on add button to add a member": (assert, ctx) => async function () {
                await click('[data-add="members"]');
                assert.ok(true, "User clicks on add button to add a member");
            }
        },
        {
            "User selects $userName as a member of project": (assert, ctx) => async function (userName) {
                await selectChoose('div[data-field="select-member"] div.input-group', `${userName}`);
                assert.ok(true, `${userName} selected`);
            }
        },
        {
            "User selects a role $roleIndex for that member": (assert, ctx) => async function (roleIndex) {
                await selectChoose('div[data-field="select-role"] div.input-group', '.ember-power-select-option', parseInt(roleIndex - 1));
                assert.ok(true, `role selected`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User $id is added as a member of project": (assert, ctx) => async function (id) {

                assert.dom(`[data-member-id="${id}"]`).exists();
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}