import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert).given('Conversation has $count comment', function (count) {
        let conversationroom = server.schema.conversationrooms.find(1);
        let comments = server.createList('comment', 1);
        comments.forEach(comment => {
            comment.update({
                conversationId: conversationroom.id,
            });
        });
        conversationroom.update({
            comments: comments,
            roomType: 'discussion'
        });
        assert.equal(conversationroom.comments.length, count, 'Conversation has ' + count + ' comment');
    })
        .given('Comment is created by User_$userId', function (userId) {
            let comment = server.schema.comments.find(1);
            comment.update({
                createdUser: server.schema.users.find(parseInt(userId, 10)).id
            });
        })
        .when('User clicks on edit button of comment', async function () {
            await click('[data-btn="edit"]');
        })
        .when('User updates comment having description $commentDescription', async function (commentDescription) {
            let contentEditableDiv = document.querySelector('.modal .edit-comment-form div.tui-editor-contents[contenteditable="true"]');
            if (!contentEditableDiv) {
                contentEditableDiv = document.querySelector('.modal div.tui-editor-contents[contenteditable="true"]');
            }
            await fillIn(contentEditableDiv, commentDescription);
            assert.ok(true, "User updates comment description");
        })
        .then('User shouldn\'t see edit button of comment', function () {
            assert.dom('[data-btn="edit"]').doesNotExist();
        })
        .then('Comment having description $commentDescription is updated', function (commentDescription) {
            assert.dom('.comment-text').includesText(commentDescription, 'Comment is updated with new description');
        })
}

