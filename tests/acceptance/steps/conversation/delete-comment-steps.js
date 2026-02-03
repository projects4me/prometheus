import steps from '../steps';
import { click } from '@ember/test-helpers';

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
        .when('User clicks on delete button of comment', async function () {
            await click('[data-btn="delete"]');
        })
        .then('Conversation has $count comments', function (count) {
            assert.dom('.comment-item-wrapper').exists({ count: parseInt(count, 10) });
        })
        .then('User shouldn\'t see delete button of comment', function () {
            assert.dom('[data-btn="delete"]').doesNotExist();
        })
}
