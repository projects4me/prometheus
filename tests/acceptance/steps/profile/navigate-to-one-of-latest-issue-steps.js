import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on latest issue $issueIndex": (assert) => async function (issueIndex) {
                let latestIssue = server.schema.userlatestissues.find(parseInt(issueIndex));
                await click(`[data-issue="${latestIssue.subject}"] [data-latest-issue-field="subject"] a`);
                assert.ok(true, `User clicks on latest issue ${issueIndex}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}