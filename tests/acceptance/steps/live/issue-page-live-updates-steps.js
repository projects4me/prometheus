/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { toArray } from 'prometheus/utils/array/to-array';

/**
 * #UNCOMMON steps for issue-page-live-updates.feature only.
 * Do not add these to tests/acceptance/steps/steps.js.
 *
 * @module tests/acceptance/steps/live/issue-page-live-updates-steps
 */
export default function (assert) {
	let toasts = [];
	let originalMessenger;

	// Restore the real Messenger after every test, also when a step failed before the last one
	QUnit.testDone(() => {
		if (originalMessenger) {
			window.Messenger = originalMessenger;
			originalMessenger = null;
		}
		toasts.length = 0;
	});

	function pageController(context) {
		return context.owner.lookup('controller:app.project.issue.page');
	}

	return steps(assert)
		.given('The issue $number has the conversation room $room', async function (number, room) {
			let issue = server.schema.issues.findBy({ issueNumber: parseInt(number, 10) });
			issue.update({ conversationRoomId: room });
			originalMessenger = window.Messenger;
			toasts.length = 0;
			window.Messenger = function () {
				return { post: (options) => toasts.push(options) };
			};
			assert.ok(true, `Issue ${number} has the room ${room}`);
		})
		.when('The comment $id exists in the room $room', async function (id, room) {
			server.create('comment', { id, relatedId: room, relatedTo: 'conversationrooms', comment: 'A live comment' });
			assert.ok(true, `Comment ${id} exists in ${room}`);
		})
		.then('The open issue has the status $name', async function (name) {
			assert.equal(pageController(this).issue.status, name, 'Status follows the event');
		})
		.then('A toast says the status was changed', async function () {
			assert.ok(toasts.some((toast) => toast.type === 'info'), 'An info toast was shown');
		})
		.then('The open issue is assigned to user $id', async function (id) {
			assert.equal(String(pageController(this).issue.get('assignedTo.id')), id, 'Assignee follows the event');
		})
		.then('The open issue lists the comment $id once', async function (id) {
			let comments = toArray(pageController(this).issue.comments).filter((comment) => comment.id === id);
			assert.equal(comments.length, 1, 'Comment is listed once');
		})
		.then('$count toasts were shown', async function (count) {
			assert.equal(toasts.length, parseInt(count, 10), 'One toast per remote change');
		});
}
