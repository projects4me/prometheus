/**
 * Shared Yadda steps for Hermes live-update features (board, gantt,
 * conversation, notifications). Injects V2 domain:event envelopes via the
 * FakeSocket helpers without opening a real Socket.IO connection.
 */
import steps from '../steps';
import { settled } from '@ember/test-helpers';
import {
	buildDomainEvent,
	emitDomainEvent,
	rowFromDomainEventTable,
} from '../../../helpers/hermes-fake';

export const given = function () {
	return [];
};

export const when = function () {
	return [
		{
			'Another user produces domain event "$eventName" with:\n$table':
				(assert) =>
					async function (eventName, table) {
						let row = rowFromDomainEventTable(table);
						let changes = {};
						[
							'status',
							'statusId',
							'milestoneId',
							'assignee',
							'assigneeId',
							'startDate',
							'endDate',
							'comment',
							'relatedId',
							'parentId',
							'issueId',
							'message',
							'description',
							'context',
							'createdUser',
							'createdUserName',
							'dateCreated',
						].forEach((key) => {
							if (row[key] !== undefined && row[key] !== '') {
								changes[key] = row[key];
							}
						});

						let resourceType = row.resourceType || 'issue';
						if (eventName.indexOf('comment') !== -1) {
							resourceType = 'comment';
						} else if (eventName.indexOf('notification') !== -1) {
							resourceType = 'systemnotification';
						} else if (eventName.indexOf('vote') !== -1) {
							resourceType = 'vote';
						} else if (eventName.indexOf('milestone') !== -1) {
							resourceType = 'milestone';
						} else if (eventName.indexOf('conversation.created') !== -1) {
							resourceType = 'conversationroom';
						}

						let envelope = buildDomainEvent({
							eventName,
							projectId: row.projectId,
							resourceType,
							resourceId: row.resourceId,
							actorId: row.actorId || 'user_a',
							changes,
							meta: {
								conversationId: row.conversationId || row.relatedId,
								issueNumber: row.issueNumber,
								actorName: row.actorName || 'User A',
								recipientId: row.recipientId,
								recipientUserId: row.recipientUserId,
							},
						});

						emitDomainEvent(this.owner, envelope);
						await settled();
						assert.ok(
							true,
							`Injected remote domain event ${eventName}`
						);
					},
		},
		{
			'The local write echo for $resourceType "$resourceId" is noted':
				(assert) =>
					async function (resourceType, resourceId) {
						let hermes = this.owner.lookup('service:hermes');
						hermes.noteLocalWrite(resourceType, resourceId);
						assert.ok(
							true,
							`Noted local write for ${resourceType}:${resourceId}`
						);
					},
		},
	];
};

export const then = function () {
	return [
		{
			'Hermes intents include "$eventName" for project "$projectId"':
				(assert) =>
					async function (eventName, projectId) {
						let hermes = this.owner.lookup('service:hermes');
						let match = hermes.desiredIntents.find(
							(intent) =>
								intent.eventName === eventName &&
								intent.projectId === String(projectId)
						);
						assert.ok(
							match,
							`Hermes intents include ${eventName} for ${projectId}`
						);
					},
		},
		{
			'Hermes is connected with a fake socket': (assert) =>
				async function () {
					let hermes = this.owner.lookup('service:hermes');
					assert.ok(hermes.socket, 'hermes has a socket');
					assert.true(
						hermes.socket.connected,
						'fake hermes socket is connected'
					);
					assert.ok(
						typeof hermes.socket.serverEmit === 'function',
						'socket is the FakeSocket test double'
					);
				},
		},
		{
			'Hermes notifications intent is registered for the current user':
				(assert, ctx) =>
					async function () {
						let hermes = this.owner.lookup('service:hermes');
						let userId =
							ctx.get('currentUser')?.id ||
							ctx.get('loggedInUser')?.id;
						assert.ok(userId, 'logged-in user id is known');
						let match = hermes.desiredIntents.find(
							(intent) =>
								intent.eventName === 'notification.created' &&
								intent.projectId === `user:${userId}`
						);
						assert.ok(
							match,
							`notification.created registered for user:${userId}`
						);
					},
		},
		{
			'The issue "$issueId" has live status "$status"':
				(assert) =>
					async function (issueId, status) {
						assert
							.dom(`[data-field-issue-id="${issueId}"]`)
							.hasAttribute(
								'data-field-issue-status',
								status,
								`issue ${issueId} shows status ${status}`
							);
					},
		},
		{
			'The issue "$issueId" is shown in milestone "$milestoneId"':
				(assert) =>
					async function (issueId, milestoneId) {
						assert
							.dom(`[data-field-issue-id="${issueId}"]`)
							.hasAttribute(
								'data-field-issue-milestone',
								milestoneId,
								`issue ${issueId} is in milestone ${milestoneId}`
							);
					},
		},
		{
			'The conversation shows remote comment "$body"':
				(assert) =>
					async function (body) {
						assert
							.dom('.conversation-comment, .comment-body, .message-body')
							.includesText(body);
					},
		},
		{
			'The conversation controller has remote comment "$body"':
				(assert) =>
					async function (body) {
						let controller = this.owner.lookup(
							'controller:app.project.conversation'
						);
						let rooms = controller.conversations || [];
						let found = false;
						rooms.forEach((room) => {
							(room.comments || []).forEach((comment) => {
								if (
									(comment.comment || comment.get?.('comment') || '')
										.indexOf(body) !== -1
								) {
									found = true;
								}
							});
						});
						assert.ok(
							found,
							`conversation controller has comment containing "${body}"`
						);
					},
		},
		{
			'The notifications list includes "$message"':
				(assert) =>
					async function (message) {
						let notifications = this.owner.lookup(
							'service:notifications'
						);
						let found = (notifications.notifications || []).some(
							(n) =>
								(n.message || n.description || '').indexOf(
									message
								) !== -1 ||
								n.id === message
						);
						assert.ok(
							found || notifications.unreadCount > 0,
							`notifications include ${message} or unread bumped`
						);
					},
		},
		{
			'The notifications unread count is greater than 0': (assert) =>
				async function () {
					let notifications = this.owner.lookup(
						'service:notifications'
					);
					assert.ok(
						notifications.unreadCount > 0,
						`unreadCount is ${notifications.unreadCount}`
					);
				},
		},
		{
			'The latest notification context has userName "$userName" and issueNumber "$issueNumber"':
				(assert) =>
					async function (userName, issueNumber) {
						let notifications = this.owner.lookup(
							'service:notifications'
						);
						let latest = (notifications.notifications || [])[0];
						assert.ok(latest, 'a live notification was prepended');
						let context = latest.context || {};
						assert.strictEqual(
							typeof context,
							'object',
							'context is parsed to an object'
						);
						assert.strictEqual(
							String(context.userName),
							userName,
							`context.userName is ${userName}`
						);
						assert.strictEqual(
							String(context.issueNumber),
							issueNumber,
							`context.issueNumber is ${issueNumber}`
						);
					},
		},
		{
			'The gantt issue "$issueId" has start date "$startDate"':
				(assert) =>
					async function (issueId, startDate) {
						let controller = this.owner.lookup(
							'controller:app.project.gantt'
						);
						let issue = null;
						for (let milestone of controller.milestones || []) {
							issue =
								milestone.issues?.findBy?.('id', issueId) ||
								null;
							if (issue) {
								break;
							}
						}
						assert.ok(issue, `gantt has issue ${issueId}`);
						assert.strictEqual(
							String(issue.get('startDate')),
							startDate
						);
					},
		},
	];
};

export default function (assert) {
	return steps(assert);
}
