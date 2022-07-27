import { fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User search $issueSubject from milestone $milestoneId": (assert, ctx) => async function (issueSubject, milestoneId) {
                let inputEl = document.querySelector(`input[data-input-milestone-id="${milestoneId}"]`);
                await fillIn(inputEl, "Issue Test 4");
                assert.ok(true, `User searches for ${issueSubject} from milestone ${milestoneId}`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There should be only issue $issueId present inside milestone $milestoneId": (assert) => async function (issueId, milestoneId) {
                let issueItems = document.querySelectorAll(`div.milestone.box-body[data-field-milestone-id="${milestoneId}"] div.item`);
                assert.equal(issueItems.length, '1', `only 1 issue present inside milestone ${milestoneId} after searching`);
                assert.equal(issueItems[0].dataset.fieldIssueId, `${issueId}`, `issue ${issueId} present inside milestone ${milestoneId}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}