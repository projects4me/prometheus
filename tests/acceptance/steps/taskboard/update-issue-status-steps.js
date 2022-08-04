import steps from '../steps';
import { triggerEvent } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User change status of issue $issueId to $status": () => async function (issueId, status) {
                let item = document.querySelector(`div.item[data-field-issue-id="${issueId}"]`);
                let issue = server.schema.issues.find(issueId);
                issue.update({ 'status': status });

                await triggerEvent(item, "pointerdown", {
                    button: 0
                });

            },
        }
    ];
}

export default function (assert) {
    return steps(assert)
}