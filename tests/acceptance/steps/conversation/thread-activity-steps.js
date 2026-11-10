import { click } from '@ember/test-helpers';
import voteThreadSteps from './vote-thread-steps';

// Builds on the vote thread steps (vote thread setup, opening a thread from the latest conversations)
export default function (assert) {
	return voteThreadSteps(assert).
		given('Conversation $conversationIndex has the activities\n$table', function (conversationIndex, table) {
			let conversation = server.schema.conversationrooms.find(parseInt(conversationIndex));
			for (let row of table) {
				let context = { field: row.field || undefined };
				if (row.oldIssueNumber) context.oldIssueNumber = row.oldIssueNumber;
				if (row.newIssueNumber) context.newIssueNumber = row.newIssueNumber;
				server.create('activity', {
					relatedTo: 'conversationroom',
					relatedId: conversation.id,
					type: row.type,
					createdUser: row.user,
					dateCreated: row.dateCreated,
					context
				});
			}
			assert.ok(true, `Conversation ${conversationIndex} has ${table.length} activities`);
		}).
		when('User shows more activities', async function () {
			await click('[data-btn="show-more-activities"]');
			assert.ok(true, 'User shows more activities');
		}).
		then('The Activity box lists $count rows, newest first', function (count) {
			assert.dom('[data-activity-box] [data-activity-row]').exists({ count: parseInt(count) });
		}).
		then('The Activity box row $index reads "$sentence"', function (index, sentence) {
			assert.dom(`[data-activity-box] [data-activity-row]:nth-child(${index}) [data-activity-sentence]`).hasText(sentence);
			assert.dom(`[data-activity-box] [data-activity-row]:nth-child(${index}) [data-activity-date]`).exists();
		}).
		then('The Activity box has no Show more button', function () {
			assert.dom('[data-btn="show-more-activities"]').doesNotExist();
		});
}
