import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import NotificationsStub from '../../../stub-services/notifications-stub';
import CurrentUserStub from '../../../stub-services/current-user-stub';

module(
	'Integration | Component | app-ui/notifications/notification',
	function (hooks) {
		setupRenderingTest(hooks);

		hooks.beforeEach(function () {
			this.owner.register('service:notifications', NotificationsStub);
			this.notifications = this.owner.lookup('service:notifications');
			this.owner.register('service:current-user', CurrentUserStub);
		});

		test('it renders notification correctly', async function (assert) {
			this.set('notificationItem', {
				id: '1',
				title: 'Test Notification',
				description: 'Test notification description',
				context: {
					relatedTo: 'issue',
					projectShortcode: 'TEST',
					issueNumber: '123'
				},
				recipientRecords: [{ userId: '1', isRead: '0' }],
				dateCreated: new Date(),
				createdUser: 'user1',
				createdUserName: 'Test User'
			});

			await render(
				hbs`<AppUi::Notifications::Notification @notification={{this.notificationItem}} />`
			);

			assert
				.dom('[data-test-notification]')
				.exists('Notification element exists');
			assert
				.dom('[data-test-notification-id="1"]')
				.exists('Notification has correct ID');
			assert
				.dom('[data-test-notification-link]')
				.exists('Notification link exists');
			assert
				.dom('[data-test-notification-timestamp]')
				.exists('Timestamp exists');
		});

		test('it applies unread class for unread notifications', async function (assert) {
			this.set('notificationItem', {
				id: '2',
				description: 'Unread notification',
				context: { relatedTo: 'project', projectShortcode: 'TEST' },
				recipientRecords: [{ userId: '1', isRead: '0' }], // unread
				dateCreated: new Date(),
				createdUser: 'user1'
			});

			await render(
				hbs`<AppUi::Notifications::Notification @notification={{this.notificationItem}} />`
			);

			assert
				.dom('[data-test-notification]')
				.hasClass('unread-notification', 'Unread class is applied');
		});

		test('it generates the correct link for issue notifications', async function (assert) {
			this.set('notificationItem', {
				id: '3',
				description: 'Issue notification',
				context: {
					relatedTo: 'issue',
					projectShortcode: 'TEST',
					issueNumber: '123'
				},
				recipientRecords: [{ userId: '1', isRead: '0' }],
				dateCreated: new Date(),
				createdUser: 'user1'
			});

			await render(
				hbs`<AppUi::Notifications::Notification @notification={{this.notificationItem}} />`
			);

			assert
				.dom('[data-test-notification-link]')
				.hasAttribute(
					'href',
					'/app/project/test/issue/123',
					'Issue link is correct'
				);
		});
	}
);
