import { click, currentURL, fillIn } from '@ember/test-helpers';
import steps from '../steps';
import { chooseOption, chooseOptionAt, openSelect, searchSelect } from 'prometheus/tests/helpers/select';

const LINK_ISSUE_SELECTOR = 'dialog.app-modal [data-field="conversation.linkedIssue"]';

export default function (assert) {
    return (
        steps(assert)
            .given('Project has 5 unlinked issues', async function () {
                let project = server.schema.projects.find(1);
                if (!project) {
                    project = server.create('project', { id: 1, shortCode: 'project_1' });
                }
                for (let i = 1; i <= 5; i++) {
                    server.create('issue', {
                        projectId: project.id,
                        projectShortcode: project.shortCode,
                        issueNumber: String(i),
                        subject: `Issue Test ${i}`,
                        status: 'new',
                        priority: 'medium'
                    });
                }
                assert.ok(true, 'Project has 5 unlinked issues');
            })
            .when('User clicks on add button to create conversation', async function () {
                let addBtn = document.querySelector('[data-btn="addConversation"]');
                await click(addBtn);
                assert.ok(true, 'User clicks on add button to create conversation');
            })
            .when('User enters $subject in subject of conversation', async function (subject) {
                let subjectInputEl = document.querySelector('[data-field="newConversation.subject"] input');
                await fillIn(subjectInputEl, subject);
                assert.ok(true, `User enters ${subject} in subject of conversation`);
            })
            .when('User enters $description in description of conversation', async function (description) {
                let descriptionInputEl = document.querySelector('[data-field="newConversation.description"] div.tui-editor-contents.tui-editor-contents-placeholder');
                await fillIn(descriptionInputEl, description);
                assert.ok(true, `User enters ${description} in description of conversation`);
            })
            .when('User selects type of conversation', async function () {
                let selectEl = document.querySelector('[data-field="newConversation.roomType"] > div.input-group');
                await chooseOptionAt(selectEl.querySelector('div'), 1);
                assert.ok(true, 'User selects type of conversation');
            })
            .when('User selects Discussion as conversation type', async function () {
                let selectEl = document.querySelector('[data-field="newConversation.roomType"] > div.input-group');
                await chooseOptionAt(selectEl.querySelector('div'), 0);
                assert.ok(true, 'User selects Discussion as conversation type');
            })
            .when('User searches and selects issue #$issueNumber in link issue', async function (issueNumber) {
                await openSelect(LINK_ISSUE_SELECTOR);
                await searchSelect(LINK_ISSUE_SELECTOR, issueNumber);
                await chooseOption(LINK_ISSUE_SELECTOR, `#${issueNumber}`);
                assert.ok(true, `User searches and selects issue #${issueNumber} in link issue`);
            })
            .then('there is a conversation having a topic of $expectedTopic', async function (expectedTopic) {
                assert.ok(true, `there is a conversation having a topic of ${expectedTopic}`);
            })
            .then('the conversation is linked with issue #$issueNumber', async function (issueNumber) {
                assert.ok(/\/conversations\/[^/?]+/.test(currentURL()), `the app opened the new thread page: ${currentURL()}`);
                let linked = server.schema.conversationrooms.all().models.find((room) => room.issueId);
                assert.ok(linked, 'a conversation is linked to an issue');
                assert.equal(server.schema.issues.find(linked.issueId).issueNumber, String(issueNumber), `linked to issue #${issueNumber}`);
            })
    );
}
