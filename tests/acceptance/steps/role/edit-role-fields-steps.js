import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User selects role $roleIndex": (assert) => async function (roleIndex) {
                await click(`[data-role-browser] [data-role="${roleIndex}"]`);
            }
        },
        {
            "User clicks on the role name to edit": (assert) => async function () {
                await click('[data-role-field="name"] .app-ui-inline-editable__surface');
            }
        },
        {
            "User edits the role name to $name": (assert) => async function (name) {
                await fillIn('[data-field="role.name"] input', name);
            }
        },
        {
            "User clicks on the role description to edit": (assert) => async function () {
                await click('[data-role-field="description"] .app-ui-inline-editable__surface');
            }
        },
        {
            "User edits the role description to $description": (assert) => async function (description) {
                await fillIn('[data-field="role.description"] textarea', description);
            }
        },
        {
            "User saves the role inline edit": (assert) => async function () {
                await click(document.querySelector('.role-record .app-ui-inline-editable__toolbar button[aria-label="Save"]'));
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "The role name shows $name": (assert) => async function (name) {
                assert.dom('[data-role-field="name"] .app-ui-inline-editable__display-value').hasText(name);
            }
        },
        {
            "The role description shows $description": (assert) => async function (description) {
                assert.dom('[data-role-field="description"] .app-ui-inline-editable__display-value').hasText(description);
            }
        },
        {
            "The role record box shows the initials, access, members and actions facts": (assert) => async function () {
                let box = document.querySelector('.box.box-primary.role-record');
                assert.ok(box, 'role record box is rendered');
                assert.ok(box.querySelector('[data-role-field="initials"]').textContent.trim().length > 0, 'initials shown');
                assert.ok(box.querySelector('[data-role-fact="access"]'), 'access fact shown');
                assert.ok(/^\d+$/.test(box.querySelector('[data-role-field="members"]').textContent.trim()), 'members count shown');
                assert.ok(/^\d+ of \d+$/.test(box.querySelector('[data-role-field="actions"]').textContent.trim()), 'actions granted shown');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}