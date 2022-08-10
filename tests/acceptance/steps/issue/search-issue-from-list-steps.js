import steps from '../steps';

export const then = function () {
    return [
        {
            "the searched issue should be inside list": (assert) => async function () {
                let issueRow = document.querySelector('div.row.issues table tbody tr');
                let expectedIssueSubject = issueRow.querySelector('td.issue-subject');
                assert.dom(expectedIssueSubject).hasText(server.schema.issues.find(1).subject);
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}
