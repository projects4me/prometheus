import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User selects role $roleIndex": (assert) => async function (roleIndex) {
                await click(`[data-role-browser] [data-role="${roleIndex}"]`);
            }
        }
    ];
}

export const then = function () {
    return [
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