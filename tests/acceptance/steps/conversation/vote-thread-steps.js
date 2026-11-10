import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert).
		given('Conversation $conversationIndex is a vote thread with $agree agree votes and $disagree disagree votes', function (conversationIndex, agree, disagree) {
			let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
			conversation.update({ roomType: 'vote' });
			let number = 0;
			let cast = (text, count) => {
				for (let i = 0; i < parseInt(count); i++) {
					number++;
					server.create('comment', {
						relatedTo: 'conversationrooms',
						relatedId: conversation.id,
						comment: text,
						createdUser: `voter-${number}`,
						createdUserName: `Voter ${number}`,
						dateCreated: `2026-01-01 10:00:${String(number).padStart(2, '0')}`
					});
				}
			};
			cast('I agree', agree);
			cast('I disagree', disagree);
			assert.ok(true, `Conversation ${conversationIndex} is a vote thread`);
		}).
		when('User opens the vote thread $conversationIndex from the latest conversations', async function (conversationIndex) {
			let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
			await click(`[data-conversation-id="${conversation.id}"] a`);
			assert.ok(true, `User opens the vote thread ${conversationIndex}`);
		}).
		when('User votes "$side" on the open vote', async function (side) {
			await click(`[data-thread-vote] [data-btn="vote-${side}"]`);
			assert.ok(true, `User votes ${side}`);
		}).
		then('Vote body counts $agree agree and $disagree disagree votes, "$leaning" and the hint to vote', function (agree, disagree, leaning) {
			assertTallies(assert, agree, disagree, leaning);
			assert.dom('[data-vote-status="hint"]').hasText("You haven't voted yet. Click a thumb to vote; one vote per person.");
		}).
		then('Vote body counts $agree agree and $disagree disagree votes, "$leaning" and "$status"', function (agree, disagree, leaning, status) {
			assertTallies(assert, agree, disagree, leaning);
			assert.dom('[data-vote-status="voted"]').hasText(status);
		}).
		then('Vote body has no reply box and no linked issue box', function () {
			assert.dom('[data-thread-reply]').doesNotExist('No reply box');
			assert.dom('[data-linked-issue-box]').doesNotExist('No linked issue box');
			assert.dom('[data-result-box].box-warning').exists('The result box is shown');
		}).
		then('Vote body thumbs are locked', function () {
			assert.dom('[data-btn="vote-agree"]').doesNotExist('The agree thumb is locked');
			assert.dom('[data-btn="vote-disagree"]').doesNotExist('The disagree thumb is locked');
		}).
		then('Vote body lists $count votes', function (count) {
			assert.dom('[data-voter-count]').hasText(`${count} votes`);
			assert.dom('[data-voter]').exists({ count: parseInt(count) });
		});
}

/**
 * Asserts the tallies and the leaning of the open vote thread
 *
 * @param {Object} assert
 * @param {String} agree
 * @param {String} disagree
 * @param {String} leaning
 */
function assertTallies(assert, agree, disagree, leaning) {
	assert.dom('[data-vote-count="agree"]').hasText(String(agree));
	assert.dom('[data-vote-count="disagree"]').hasText(String(disagree));
	assert.dom('[data-vote-leaning]').hasText(leaning);
}
