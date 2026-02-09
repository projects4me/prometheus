import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert).given('Conversation is created by User_$userId', async function (userId) {
        let conversationroom = server.schema.conversationrooms.find(1);
        conversationroom.update({
            createdUser: server.schema.users.find(parseInt(userId, 10)).id
        });
        assert.ok(true, `Conversation is created by User_${userId}`);
    })
        .when('User clicks on edit button of conversation', async function () {
            await click('[data-btn="edit-conversation"]');
            assert.ok(true, "User clicks on edit button of conversation");
        })
        .when('User updates conversation subject to $subject', async function (subject) {
            let subjectInput = document.querySelector('.modal div[data-field="conversation.subject"] input');
            await fillIn(subjectInput, subject);
            assert.ok(true, "User updates conversation subject");
        })
        .when('User updates conversation description to $description', async function (description) {
            let contentEditableDiv = document.querySelector('.modal .edit-conversation-form div.tui-editor-contents[contenteditable="true"]');
            if (!contentEditableDiv) {
                contentEditableDiv = document.querySelector('.modal div.tui-editor-contents[contenteditable="true"]');
            }
            await fillIn(contentEditableDiv, description);
            assert.ok(true, "User updates conversation description");
        })
        .then('User shouldn\'t see edit button of conversation', function () {
            assert.dom('[data-btn="edit-conversation"]').doesNotExist('Edit button should not be visible');
        })
        .then('Conversation subject is updated to $subject', function (subject) {
            assert.dom('.conversation-item .subject').includesText(subject, 'Conversation subject is updated');
        })
        .then('Conversation description is updated to $description', function (description) {
            assert.dom('.conversation-item .box-body p').includesText(description, 'Conversation description is updated');
        })
}