/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import ENV from 'prometheus/config/environment';
import { click, currentURL, find } from '@ember/test-helpers';

/**
 * Creates an unread comment notification that belongs to an issue
 *
 * @param {Object} ctx Yadda context
 * @param {Object} issue Context fields of the issue: id, issueNumber, projectShortcode
 */
function createIssueNotification(ctx, issue) {
	let notification = server.create('systemnotification', {
		description: 'Commented on issue',
		relatedTo: 'issue',
		relatedId: issue.id,
		context: {
			projectShortcode: issue.projectShortcode,
			issueNumber: issue.issueNumber,
			commentId: '1',
			relatedTo: 'comment'
		}
	});
	server.schema.systemnotificationrecipients
		.where({ systemnotificationId: notification.id })
		.models.forEach((recipient) => recipient.destroy());
	let recipient = server.create('systemnotificationrecipient', {
		userId: ctx.currentUser?.id || server.schema.users.first().id,
		systemnotificationId: notification.id,
		isRead: '0'
	});
	notification.update({ recipientRecords: [recipient] });
	ctx.set('notificationIssue', issue);
	ctx.set('notificationId', notification.id);
}

/**
 * Clicks an element with notification navigation enabled and records the
 * route transition instead of performing it
 *
 * @param {Object} owner Application owner
 * @param {Object} ctx Yadda context
 * @param {String} selector Element to click
 */
async function clickWithNavigation(owner, ctx, selector) {
	let router = owner.lookup('service:router');
	let transitionTo = router.transitionTo;
	let enableNav = ENV.app.notifications.enableNav;
	ctx.set('transitions', []);
	router.transitionTo = (...args) => {
		ctx.get('transitions').push(args);
	};
	ENV.app.notifications.enableNav = true;
	try {
		await click(selector);
	} finally {
		ENV.app.notifications.enableNav = enableNav;
		router.transitionTo = transitionTo;
	}
}

export const given = function () {
	return [
		{
			'User has an unread comment notification for the first issue on the board':
				(assert, ctx) =>
					async function () {
						let issue = server.schema.issues.all().models[0];
						createIssueNotification(ctx, {
							id: issue.id,
							issueNumber: String(issue.issueNumber),
							projectShortcode: 'project_1'
						});
						assert.ok(true, this.step);
					}
		},
		{
			'User has an unread comment notification for an issue that is not on the board':
				(assert, ctx) =>
					async function () {
						createIssueNotification(ctx, {
							id: 'not-on-board',
							issueNumber: '9999',
							projectShortcode: 'other'
						});
						assert.ok(true, this.step);
					}
		}
	];
};

export const when = function () {
	return [
		{
			'User clicks on the issue notification': (assert, ctx) =>
				async function () {
					await click(
						`[data-notification-id="${ctx.get('notificationId')}"] [data-notification-link]`
					);
					assert.ok(true, this.step);
				}
		},
		{
			'User clicks on the notification group heading': (assert, ctx) =>
				async function () {
					await click('[data-notification-group-link]');
					assert.ok(true, this.step);
				}
		},
		{
			'User clicks on the issue notification with navigation enabled': (
				assert,
				ctx
			) =>
				async function () {
					await clickWithNavigation(
						this.owner,
						ctx,
						`[data-notification-id="${ctx.get('notificationId')}"] [data-notification-link]`
					);
					assert.ok(true, this.step);
				}
		}
	];
};

export const then = function () {
	return [
		{
			"The board's quick view shows the issue of the notification": (
				assert,
				ctx
			) =>
				async function () {
					let controller = this.owner.lookup('controller:app.project.board');
					assert.equal(
						controller.selectedIssue?.id,
						ctx.get('notificationIssue').id,
						'The quick view shows the issue of the notification'
					);
					assert.ok(
						find('.board-panel-divider'),
						'The quick view is open next to the board'
					);
				}
		},
		{
			'The URL is still the task board': (assert, ctx) =>
				async function () {
					assert.equal(currentURL(), '/app/project/project_1/board');
				}
		},
		{
			'The issue page of the notification is opened': (assert, ctx) =>
				async function () {
					let issue = ctx.get('notificationIssue');
					assert.deepEqual(ctx.get('transitions'), [
						[`/app/project/${issue.projectShortcode}/issue/${issue.issueNumber}`]
					]);
				}
		},
		{
			'The issue notification is marked as read': (assert, ctx) =>
				async function () {
					assert
						.dom(`[data-notification-id="${ctx.get('notificationId')}"]`)
						.doesNotHaveClass('unread-notification');
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
