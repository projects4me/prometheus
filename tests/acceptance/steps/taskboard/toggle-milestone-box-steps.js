import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User toggle milestone $milestoneId container": (assert, ctx) => async function (milestoneId) {
                let milestoneHeader = document.querySelector(`div[data-field-milestone-id="${milestoneId}"]`).parentNode;
                let toggleBtn = milestoneHeader.querySelector(`button[data-widget="collapse"]`);
                ctx['toggleBtn'] = toggleBtn;
                await click(toggleBtn);
                assert.ok(true, `User toggle milestone ${milestoneId} container`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "milestone box is toggled": (assert, ctx) => async function () {
                let toggleBtn = ctx.get('toggleBtn');
                assert.dom(toggleBtn.querySelector('i')).hasClass('fa-plus');
            }
        }
    ];
}


export default function (assert) {
    return steps(assert);
}