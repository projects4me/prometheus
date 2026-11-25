import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { isUnreadFor } from 'prometheus/utils/notifications/recipient';

const USER_ID = 'user-1';

/**
 * One notification and its recipient records in the shape Gaia sends them:
 * `isRead` is a number, not a string.
 */
function gaiaNotification(id, date, recipients) {
	return {
		data: {
			type: 'Systemnotification',
			id,
			attributes: {
				dateCreated: date,
				description: `Notification ${id}`,
				relatedTo: 'issue',
				relatedId: `issue-${id}`
			},
			relationships: {
				recipientRecords: {
					data: recipients.map((r) => ({
						type: 'systemnotificationrecipient',
						id: r.id
					}))
				}
			}
		},
		included: recipients.map((r) => ({
			type: 'systemnotificationrecipient',
			id: r.id,
			attributes: {
				systemNotificationId: id,
				userId: r.userId,
				isRead: r.isRead
			}
		}))
	};
}

function gaiaPage(notifications, unreadCount) {
	return {
		data: notifications.map((n) => n.data),
		included: notifications.flatMap((n) => n.included),
		meta: { count: notifications.length, unreadCount }
	};
}

module('Integration | Service | notifications | pagination', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		const unreadTop = [
			gaiaNotification('n1', '2026-11-25 10:00:00', [
				{ id: 'r1', userId: USER_ID, isRead: 0 }
			]),
			gaiaNotification('n2', '2026-11-25 09:00:00', [
				{ id: 'r2', userId: USER_ID, isRead: 0 }
			])
		];
		const older = [
			gaiaNotification('n3', '2026-11-24 10:00:00', [
				{ id: 'r3', userId: USER_ID, isRead: 1 }
			])
		];
		const queries = [];
		this.queries = queries;

		// Gaia: page 1 has the unread ones; page 2 the older, read ones. A
		// query without a page (the unread-only query) returns the unread top again.
		this.owner.register(
			'adapter:systemnotification',
			class extends JSONAPIAdapter {
				query(store, type, query) {
					queries.push(query);
					const page = Number(query.page ?? 1);
					return Promise.resolve(
						page === 1 ? gaiaPage(unreadTop, 2) : gaiaPage(older, 2)
					);
				}
			}
		);

		this.service = this.owner.lookup('service:notifications');
		this.service.currentUser = { user: { id: USER_ID } };
	});

	test('unread notifications on page 1 stay unread after page 2 loads', async function (assert) {
		const service = this.service;

		await service.loadNotifications();
		assert.deepEqual(
			service.notifications.map((n) => n.id),
			['n1', 'n2'],
			'page 1 is listed'
		);
		assert.deepEqual(
			service.notifications.map((n) => isUnreadFor(n, USER_ID)),
			[true, true],
			"Gaia's numeric isRead 0 reads as unread"
		);
		assert.strictEqual(service.unreadCount, 2);

		const listed = service.notifications.slice(0, 2);
		await service.loadNotifications({ page: 2, pageSize: 15 });

		assert.deepEqual(
			service.notifications.map((n) => n.id),
			['n1', 'n2', 'n3'],
			'page 2 is appended'
		);
		assert.strictEqual(service.notifications[0], listed[0], 'listed notifications are kept');
		assert.deepEqual(
			service.notifications.map((n) => isUnreadFor(n, USER_ID)),
			[true, true, false],
			'page 1 stays unread and page 2 shows its own state'
		);
		assert.strictEqual(service.unreadCount, 2, 'the unread count is unchanged');
	});

	test('pages are requested with one page size and no extra unread query', async function (assert) {
		await this.service.loadNotifications();
		await this.service.loadNotifications({ page: 2, pageSize: 15 });

		assert.deepEqual(
			this.queries.map((q) => [q.page, q.limit]),
			[
				[1, 15],
				[2, 15]
			]
		);
	});
});
