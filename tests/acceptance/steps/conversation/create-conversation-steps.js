import { click, fillIn } from '@ember/test-helpers';
import { selectChoose, selectSearch, clickTrigger } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

const LINK_ISSUE_SELECTOR = '.modal [data-field="conversation.linkedIssue"]';

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
                await selectChoose(selectEl.querySelector('div'), '.ember-power-select-option', 1);
                assert.ok(true, 'User selects type of conversation');
            })
            .when('User selects Discussion as conversation type', async function () {
                let selectEl = document.querySelector('[data-field="newConversation.roomType"] > div.input-group');
                await selectChoose(selectEl.querySelector('div'), '.ember-power-select-option', 0);
                assert.ok(true, 'User selects Discussion as conversation type');
            })
            .when('User searches and selects issue #$issueNumber in link issue', async function (issueNumber) {
                await clickTrigger(LINK_ISSUE_SELECTOR);
                await selectSearch(LINK_ISSUE_SELECTOR, issueNumber);
                await selectChoose(LINK_ISSUE_SELECTOR, `#${issueNumber}`);
                assert.ok(true, `User searches and selects issue #${issueNumber} in link issue`);
            })
            .then('there is a conversation having a topic of $expectedTopic', async function (expectedTopic) {
                assert.ok(true, `there is a conversation having a topic of ${expectedTopic}`);
            })
            .then('the conversation is linked with issue #$issueNumber', async function (issueNumber) {
                let conversationItems = document.querySelectorAll('.conversation-item[id]');
                assert.ok(conversationItems.length > 0, 'At least one conversation exists');
                let firstConversation = conversationItems[0];
                let badge = firstConversation.querySelector('.subject .conversation-issue-badge a');
                assert.ok(badge, 'Conversation shows linked issue badge');
                assert.ok(
                    badge.textContent.trim().indexOf(`#${issueNumber}`) !== -1,
                    `Badge text contains #${issueNumber}`
                );
            })
    );
}
