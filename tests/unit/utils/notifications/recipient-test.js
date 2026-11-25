import { module, test } from 'qunit';
import {
	recipientRecordFor,
	isUnreadFor
} from 'prometheus/utils/notifications/recipient';

module('Unit | Utility | notifications/recipient', function () {
	const notification = {
		recipientRecords: [
			{ userId: '2', isRead: '1' },
			{ userId: '1', isRead: '0' }
		]
	};

	test('recipientRecordFor picks the given user, not the first record', function (assert) {
		assert.strictEqual(recipientRecordFor(notification, '1'), notification.recipientRecords[1]);
		assert.strictEqual(recipientRecordFor(notification, 1), notification.recipientRecords[1], 'numeric ids match');
		assert.strictEqual(recipientRecordFor(notification, '3'), undefined);
		assert.strictEqual(recipientRecordFor(notification, undefined), undefined, 'no user, no record');
	});

	test('isUnreadFor reads the given user state', function (assert) {
		assert.true(isUnreadFor(notification, '1'));
		assert.false(isUnreadFor(notification, '2'));
		assert.false(isUnreadFor(notification, '3'), 'not a recipient');
		assert.false(isUnreadFor({}, '1'), 'no recipient records');
	});
});
