import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert).
    when('User clicks on conversation $conversationIndex from latest conversations section', async function (conversationIndex) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        await click(`[data-conversation-id="${conversation.id}"] a`);
        assert.ok(true, `User clicks on conversation ${conversationIndex} from latest conversations section`);
    }).
    then('User should see the conversation $conversationIndex in the sidepanel', function (conversationIndex) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        assert.dom(`div.conversation-opened-container .conversation-item .subject`).hasText(conversation.subject);
    }).
    then('User should see the thread box and the linked issue box of conversation $conversationIndex', function () {
        assert.dom('[data-thread-box] .box-primary').exists('The thread box is shown');
        assert.dom('[data-thread-box] [data-thread-type]').exists('The type label is shown');
        assert.dom('[data-thread-box] [data-thread-started]').exists('The started by line is shown');
        assert.dom('[data-linked-issue-box].box-info').exists('The linked issue box is shown');
    }).
    given('Conversation $conversationIndex is a discussion with $count comments', function (conversationIndex, count) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        conversation.update({ roomType: 'discussion' });
        // Comment 1 is the oldest; each one is a second newer than the one before
        for (let number = 1; number <= parseInt(count); number++) {
            server.create('comment', {
                relatedTo: 'conversationrooms',
                relatedId: conversation.id,
                comment: `Thread ${conversationIndex} comment ${number}`,
                dateCreated: `2026-01-01 10:00:${String(number).padStart(2, '0')}`
            });
        }
        assert.ok(true, `Conversation ${conversationIndex} has ${count} comments`);
    }).
    given('Conversation $conversationIndex is linked to issue $issueNumber with subject $subject', function (conversationIndex, issueNumber, subject) {
        let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
        conversation.update({ issue: server.create('issue', { issueNumber, subject }) });
        assert.ok(true, `Conversation ${conversationIndex} is linked to issue ${issueNumber}`);
    }).
    when('User loads the older comments of the thread', async function () {
        await click('[data-thread-comments] [data-btn="load-older-comments"]');
        assert.ok(true, 'User loads the older comments');
    }).
    then('User should see comments $first to $last of the thread and can load older comments', function (first, last) {
        assert.deepEqual(shownComments(), expectedComments(first, last), 'The newest comments are shown, oldest first');
        assert.dom('[data-thread-comments] [data-btn="load-older-comments"]').exists('Older comments can be loaded');
    }).
    then('User should see comments $first to $last of the thread and no older comments to load', function (first, last) {
        assert.deepEqual(shownComments(), expectedComments(first, last), 'All the comments are shown, oldest first');
        assert.dom('[data-thread-comments] [data-btn="load-older-comments"]').doesNotExist('No older comments are left');
    }).
    then('The reply $reply is the newest of $count comments of the thread', function (reply, count) {
        let comments = shownComments();
        assert.strictEqual(comments.length, parseInt(count), 'The reply is added to the comments');
        assert.strictEqual(comments[comments.length - 1], reply, 'The reply is the newest comment');
    }).
    then('The linked issue box shows issue $issueNumber with subject $subject', function (issueNumber, subject) {
        assert.dom('[data-linked-issue-box] [data-linked-issue-key]').hasText(`#${issueNumber}`);
        assert.dom('[data-linked-issue-box] [data-linked-issue-subject]').hasText(subject);
        assert.dom('[data-linked-issue-box] [data-linked-issue-status]').exists('The status label is shown');
        assert.dom('[data-linked-issue-box] [data-linked-issue-empty]').doesNotExist();
    }).
    then('The linked issue box says there is no linked issue', function () {
        assert.dom('[data-linked-issue-box] [data-linked-issue-empty]').exists('The box says there is no linked issue');
        assert.dom('[data-linked-issue-box] [data-linked-issue-key]').doesNotExist();
    });
}

/**
 * The texts of the comments shown in the open thread, in the order shown
 *
 * @returns {Array<String>}
 */
function shownComments() {
    return [...document.querySelectorAll('[data-thread-comments] .comment-item-wrapper .comment-text')].map(node => {
        // The comment's text follows the name, date and tools line
        let body = node.cloneNode(true);
        body.querySelector('.username')?.remove();
        return body.textContent.trim();
    });
}

/**
 * The texts of the comments first..last of the thread opened in the scenario (conversation 1)
 *
 * @param {String} first
 * @param {String} last
 * @returns {Array<String>}
 */
function expectedComments(first, last) {
    let texts = [];
    for (let number = parseInt(first); number <= parseInt(last); number++) {
        texts.push(`Thread 1 comment ${number}`);
    }
    return texts;
}
