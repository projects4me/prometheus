import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
        {
            "Issue $issueId has issue status $issueStatusId, issue type $issueTypeId and milestone $milestoneId": (assert) => async function (issueId, issueStatusId, issueTypeId, milestoneId) {
                let issue = server.schema.issues.find(issueId);
                let issueStatus = server.schema.issuestatuses.find(issueStatusId);
                let issueType = server.schema.issuetypes.find(issueTypeId);
                let milestone = server.schema.milestones.find(milestoneId);
                issue.update({
                    statusId: issueStatus.id,
                    typeId: issueType.id,
                    milestoneId: milestone.id,
                    issuestatus: issueStatus,
                    issuetype: issueType,
                    issuemilestone: milestone
                });
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User clicks on edit button": (assert) => async function () {
                await click('button[data-btn="edit"]');
                assert.ok(true, "User clicked on edit button");
            }
        },
        {
            "User edit issue $issueFieldToEdit to $content": (assert) => async function (issueFieldToEdit, content) {
                let selectors = {
                    subject: 'div[data-field="issue.subject"] input',
                    description: 'div.tui-editor-contents[contenteditable="true"]'

                }
                await fillIn(selectors[issueFieldToEdit], content);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}