import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Service | notifications', function (hooks) {
	setupTest(hooks);

	function makeHermesStub() {
		let registrations = [];
		return {
			registrations,
			register(owner, projectId, handlers) {
				let entry = { owner, projectId, handlers };
				registrations.push(entry);
				let disposed = false;
				return () => {
					if (!disposed) {
						disposed = true;
						let idx = registrations.indexOf(entry);
						if (idx !== -1) registrations.splice(idx, 1);
					}
				};
			}
		};
	}

	test('startLiveSync registers a user-scoped notification.created intent', function (assert) {
		let service = this.owner.lookup('service:notifications');
		let hermes = makeHermesStub();
		service.hermes = hermes;
		service.currentUser = { user: { id: 'user-42' } };

		service.startLiveSync();

		assert.strictEqual(hermes.registrations.length, 1);
		let reg = hermes.registrations[0];
		assert.strictEqual(reg.projectId, 'user:user-42');
		assert.ok(typeof reg.handlers['notification.created'] === 'function');
	});

	test('startLiveSync is idempotent', function (assert) {
		let service = this.owner.lookup('service:notifications');
		let hermes = makeHermesStub();
		service.hermes = hermes;
		service.currentUser = { user: { id: 'user-1' } };

		service.startLiveSync();
		service.startLiveSync();

		assert.strictEqual(hermes.registrations.length, 1, 'registers only once');
	});

	test('stopLiveSync disposes the registration', function (assert) {
		let service = this.owner.lookup('service:notifications');
		let hermes = makeHermesStub();
		service.hermes = hermes;
		service.currentUser = { user: { id: 'user-1' } };

		service.startLiveSync();
		assert.strictEqual(hermes.registrations.length, 1);

		service.stopLiveSync();
		assert.strictEqual(hermes.registrations.length, 0);
		assert.false(service._liveStarted);
	});

	test('onNotificationCreated prepends the notification and bumps unreadCount', function (assert) {
		let service = this.owner.lookup('service:notifications');
		service.currentUser = { user: { id: 'user-1' } };

		let pushed = [];
		service.store = {
			peekRecord(type, id) {
				return null;
			},
			push(doc) {
				let record = {
					id: doc.data.id,
					recipientRecords: []
				};
				pushed.push(record);
				return record;
			},
			createRecord() {}
		};

		service.onNotificationCreated({
			schemaVersion: 1,
			eventId: 'notif-1',
			eventName: 'notification.created',
			projectId: 'user:user-1',
			resource: { type: 'systemnotification', id: 'sn-1' },
			actorId: null,
			changes: { message: 'You were mentioned' },
			meta: { recipientId: 'snr-1', recipientUserId: 'user-1' }
		});

		assert.strictEqual(service.notifications.length, 1);
		assert.strictEqual(service.unreadCount, 1);
		assert.strictEqual(service.notifications[0].id, 'sn-1');
	});

	test('onNotificationCreated parses string context before peekOrPush', function (assert) {
		let service = this.owner.lookup('service:notifications');
		service.currentUser = { user: { id: 'user-1' } };

		let notificationAttrs = null;
		service.store = {
			peekRecord() {
				return null;
			},
			push(doc) {
				if (doc.data.type === 'systemnotification') {
					notificationAttrs = doc.data.attributes;
				}
				return {
					id: doc.data.id,
					recipientRecords: [],
					context: doc.data.attributes?.context,
					description: doc.data.attributes?.description
				};
			}
		};

		let contextJson = JSON.stringify({
			projectShortcode: 'DEMO',
			issueNumber: '3664',
			issueStatus: 'done',
			userId: '42',
			userName: 'Ali Hassan',
			relatedTo: 'issue'
		});

		service.onNotificationCreated({
			schemaVersion: 1,
			eventId: 'notif-status',
			eventName: 'notification.created',
			projectId: 'user:user-1',
			resource: { type: 'systemnotification', id: 'sn-status-1' },
			actorId: '42',
			changes: {
				description:
					'{{User@42}} has updated the {{Issue@99}} status to {{status:done}}',
				context: contextJson,
				createdUser: '42',
				createdUserName: 'Ali Hassan',
				dateCreated: '2026-08-28 10:00:00'
			},
			meta: { recipientId: 'snr-status-1', recipientUserId: 'user-1' }
		});

		assert.strictEqual(typeof notificationAttrs.context, 'object');
		assert.strictEqual(notificationAttrs.context.userName, 'Ali Hassan');
		assert.strictEqual(notificationAttrs.context.issueNumber, '3664');
		assert.strictEqual(notificationAttrs.context.projectShortcode, 'DEMO');
		assert.strictEqual(service.notifications.length, 1);
		assert.strictEqual(service.unreadCount, 1);
	});

	test('onNotificationCreated ignores duplicate notifications', function (assert) {
		let service = this.owner.lookup('service:notifications');
		service.currentUser = { user: { id: 'user-1' } };

		let existingNotification = { id: 'sn-1', recipientRecords: [] };
		service.notifications = [existingNotification];
		service.unreadCount = 1;

		service.store = {
			peekRecord() { return null; },
			push(doc) {
				return { id: doc.data.id, recipientRecords: [] };
			}
		};

		service.onNotificationCreated({
			schemaVersion: 1,
			eventId: 'notif-1',
			eventName: 'notification.created',
			projectId: 'user:user-1',
			resource: { type: 'systemnotification', id: 'sn-1' },
			actorId: null,
			changes: {},
			meta: {}
		});

		assert.strictEqual(service.notifications.length, 1, 'no duplicate added');
		assert.strictEqual(service.unreadCount, 1, 'unread count unchanged');
	});

	test('startLiveSync does nothing when user is not loaded', function (assert) {
		let service = this.owner.lookup('service:notifications');
		let hermes = makeHermesStub();
		service.hermes = hermes;
		service.currentUser = { user: null };

		service.startLiveSync();

		assert.strictEqual(hermes.registrations.length, 0);
		assert.false(service._liveStarted);
	});

	test('notification for another user scope is not applied via hermes dispatch', function (assert) {
		let service = this.owner.lookup('service:notifications');
		let hermes = this.owner.lookup('service:hermes');
		hermes.socket = {
			connected: true,
			emit(name, payload, ack) {
				ack?.({
					revision: payload.revision,
					accepted: payload.intents,
					rejected: [],
				});
			},
			off() {},
			disconnect() {},
		};
		hermes.authToken = null;
		service.hermes = hermes;
		service.currentUser = { user: { id: 'user-1' } };
		service.notifications = [];
		service.unreadCount = 0;
		service.store = {
			peekRecord() {
				return null;
			},
			push(doc) {
				return { id: doc.data.id, recipientRecords: [] };
			}
		};

		service.startLiveSync();

		hermes.dispatchDomainEvent({
			schemaVersion: 1,
			eventId: 'other-user',
			eventName: 'notification.created',
			projectId: 'user:user-other',
			resource: { type: 'systemnotification', id: 'sn-other' },
			changes: {},
			meta: {}
		});

		assert.strictEqual(service.notifications.length, 0);
		assert.strictEqual(service.unreadCount, 0);
	});
});
