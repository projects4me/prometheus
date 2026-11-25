import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import NotificationsStub from '../../../stub-services/notifications-stub';
import CurrentUserStub from '../../../stub-services/current-user-stub';

/**
 * Current user stub with the id the recipient records below belong to
 */
class SignedInUserStub extends CurrentUserStub {
	user = { id: '1', name: 'Rana Nouman' };
}

module(
	'Integration | Component | app-ui/notifications/notification',
	function (hooks) {
		setupRenderingTest(hooks);

		hooks.beforeEach(function () {
			this.owner.register('service:notifications', NotificationsStub);
			this.notifications = this.owner.lookup('service:notifications');
			this.owner.register('service:current-user', SignedInUserStub);
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
				.dom('[data-notification]')
				.exists('Notification element exists');
			assert
				.dom('[data-notification-id="1"]')
				.exists('Notification has correct ID');
			assert
				.dom('[data-notification-link]')
				.exists('Notification link exists');
			assert
				.dom('[data-notification-timestamp]')
				.exists('Timestamp exists');
			assert
				.dom('[data-notification-user-image] [data-test-avatar][data-size="m"]')
				.exists('The user picture is an AppUi avatar of size m');
		});

		test('a click on the avatar is a user click, image or initials', async function (assert) {
			this.set('notificationItem', {
				id: '1',
				description: 'd',
				context: { relatedTo: 'issue', projectShortcode: 'TEST', issueNumber: '1' },
				recipientRecords: [{ userId: '1', isRead: '0' }],
				dateCreated: new Date(),
				createdUser: 'user1',
				createdUserName: 'Test User'
			});

			await render(
				hbs`<AppUi::Notifications::Notification @notification={{this.notificationItem}} />`
			);

			let avatarInner = this.element.querySelector(
				'[data-notification-user-image] [data-test-avatar] > *'
			);
			assert.ok(avatarInner, 'The avatar renders an image or initials');
			assert.ok(
				avatarInner.closest('[data-notification-user-image]'),
				'The avatar sits inside the user wrapper'
			);
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
				.dom('[data-notification]')
				.hasClass('unread-notification', 'Unread class is applied');
		});

		test("it shows the current user's read state when there are several recipients", async function (assert) {
			this.set('notificationItem', {
				id: '3',
				description: 'Shared notification',
				context: { relatedTo: 'project', projectShortcode: 'TEST' },
				recipientRecords: [
					{ userId: '2', isRead: '1' },
					{ userId: '1', isRead: '0' }
				],
				dateCreated: new Date(),
				createdUser: 'user1'
			});

			await render(
				hbs`<AppUi::Notifications::Notification @notification={{this.notificationItem}} />`
			);

			assert
				.dom('[data-notification]')
				.hasClass('unread-notification', "the current user's record is unread");

			this.set('notificationItem', {
				...this.notificationItem,
				recipientRecords: [
					{ userId: '2', isRead: '0' },
					{ userId: '1', isRead: '1' }
				]
			});
			await settled();

			assert
				.dom('[data-notification]')
				.doesNotHaveClass('unread-notification', "another user's unread record does not count");
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
				.dom('[data-notification-link]')
				.hasAttribute(
					'href',
					'/app/project/test/issue/123',
					'Issue link is correct'
				);
		});
	}
);
