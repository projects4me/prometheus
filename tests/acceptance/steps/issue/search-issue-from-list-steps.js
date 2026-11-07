import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User selects a saved search in the issue ezSearch": (assert) => async function () {
                await click('[data-ez-saved] button');
                await click('[data-ez-saved-item]');
            }
        },
    ];
}

export const then = function () {
    return [
        {
            "the searched issue should be inside list": (assert) => async function () {
                let issueRow = document.querySelector('div.row.issues table tbody tr');
                let expectedIssueSubject = issueRow.querySelector('[data-field="issue.subject"]');
                assert.dom(expectedIssueSubject).hasText(server.schema.issues.find(1).subject);
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}
