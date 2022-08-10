import steps from '../steps';

export const then = function () {
    return [
        {
            "There are $expectedCountOfIssues issues present inside list view": (assert) => async function (expectedCountOfIssues) {
                let issueRows = document.querySelectorAll('div.row.issues table tbody tr');
                
                //checking issues subject are rendered properly.
                issueRows.forEach((issueRow, i) => {
                    let expectedIssueSubject = issueRow.querySelector('td.issue-subject > a').innerText;
                    let actualIssueSubject = server.schema.issues.find(i + 1).subject;
                    assert.equal(actualIssueSubject, expectedIssueSubject,  `${actualIssueSubject} | ${expectedIssueSubject}`);
                });

                assert.equal(issueRows.length, expectedCountOfIssues, `${expectedCountOfIssues} are present inside list view`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}