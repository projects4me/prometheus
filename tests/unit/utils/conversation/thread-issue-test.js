/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import {
	canCreateIssueFromThread,
	threadIssueDraft
} from 'prometheus/utils/conversation/thread-issue';

const room = (attributes = {}) => ({ id: '7', roomType: 'discussion', subject: 'Login fails', description: 'It fails.', ...attributes });

module('Unit | Utility | conversation/thread-issue', function () {
	test('only a discussion without a linked issue may have an issue created from it', function (assert) {
		assert.true(canCreateIssueFromThread(room()));
		assert.false(canCreateIssueFromThread(room({ roomType: 'vote' })), 'not a vote');
		assert.false(canCreateIssueFromThread(room({ issueId: '3' })), 'not a linked thread');
		assert.false(canCreateIssueFromThread(room({ belongsTo: () => ({ id: () => '3' }) })), 'not a thread linked by relationship');
		assert.false(canCreateIssueFromThread(null), 'not without a thread');
	});

	test('the draft takes the thread subject and links back to the thread', function (assert) {
		let draft = threadIssueDraft(room(), 'aprom', 'Created from the thread');
		assert.strictEqual(draft.subject, 'Login fails');
		assert.strictEqual(draft.description, 'It fails.\n\nCreated from the thread: [Login fails](/app/project/aprom/conversations/7)');
	});

	test('a thread without a description gives just the link', function (assert) {
		let draft = threadIssueDraft(room({ description: null }), 'aprom', 'Created from the thread');
		assert.strictEqual(draft.description, 'Created from the thread: [Login fails](/app/project/aprom/conversations/7)');
	});
});
