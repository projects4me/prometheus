import steps from '../../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User searches for $issueSubject inside Issue Today box": (assert, ctx) => async function (issueSubject) {
                let searchEl = document.querySelector('div.box.box-primary.issues-today input.form-control.input-sm');
                await typeIn(searchEl, issueSubject);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Issue having subject $issueSubject $existsOrNot inside Issue Today Box": (assert, ctx) => async function (issueSubject, existsOrNot) {
                let issueRow = document.querySelectorAll('div.box.box-primary.issues-today tr[role="row"] td');
                let actualIssue = [...issueRow].find(issueTD => issueTD.innerText === issueSubject);

                if (existsOrNot === "exists") {
                    assert.equal(actualIssue.innerText, issueSubject, `${issueSubject} present inside Issue Today Box`);

                } else if (existsOrNot === "not-exists") {
                    assert.equal(actualIssue, undefined, 'Issue doesn\'t exists');
                }
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}