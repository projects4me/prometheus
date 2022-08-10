import steps from '../../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on $issueSubject": (assert, ctx) => async function () {
                let issueEl = document.querySelector('div.box.box-primary.issues-today tbody tr[role="row"]');
                await click(issueEl.querySelector('a'));
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}