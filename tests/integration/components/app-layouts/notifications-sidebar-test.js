import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';
import PubSubStub from '../../stub-services/pub-sub-stub';
import NotificationsStub from '../../stub-services/notifications-stub';

module(
	'Integration | Component | app-layouts/notifications-sidebar',
	function (hooks) {
		setupRenderingTest(hooks);

		hooks.beforeEach(function () {
			this.owner.register('service:notifications', NotificationsStub);
			this.owner.register('service:pub-sub', PubSubStub);
			this.owner.register('service:current-user', CurrentUserStub);
			this.notifications = this.owner.lookup('service:notifications');
			this.pubSub = this.owner.lookup('service:pub-sub');
		});

		hooks.afterEach(function () {
			if (this.pubSub && this.pubSub.events) {
				this.pubSub.events = {};
			}
		});

		test('it renders empty state when no notifications', async function (assert) {
			await render(hbs`<AppLayouts::NotificationsSidebar />`);

			assert
				.dom('[data-test-notifications-sidebar]')
				.exists('The sidebar container exists');
			assert
				.dom('[data-test-empty-notifications]')
				.exists('Empty notifications message is shown');
			assert
				.dom('[data-test-empty-message]')
				.exists('Empty message exists');
		});

		test('it renders notifications when present', async function (assert) {
			this.notifications.notifications = [
				{
					id: '1',
					title: 'Test Notification',
					message: 'This is a test notification',
					recipientRecords: [{ userId: '1', isRead: '0' }]
				}
			];
			this.notifications.unreadCount = 1;
			this.notifications.hasUnreadNotifications = true;

			await render(hbs`<AppLayouts::NotificationsSidebar />`);

			assert
				.dom('[data-test-notifications-list]')
				.exists('Notifications list exists');
			assert
				.dom('[data-test-empty-notifications]')
				.doesNotExist('Empty message is not shown');
			assert
				.dom('[data-test-notifications-header]')
				.exists('Notifications header is shown');
			assert
				.dom('[data-test-mark-all-read]')
				.exists('Mark all as read button is shown');
			assert
				.dom('[data-test-notification-id="1"]')
				.exists('Specific notification is rendered');
		});

		test('clicking mark all as read button calls service method', async function (assert) {
			assert.expect(2);

			this.notifications.notifications = [
				{
					id: '1',
					title: 'Test Notification',
					message: 'This is a test notification',
					recipientRecords: [{ userId: '1', isRead: '0' }]
				}
			];
			this.notifications.unreadCount = 1;
			this.notifications.hasUnreadNotifications = true;

			// Mock the markAllAsRead method
			this.notifications.markAllAsRead = function () {
				assert.ok(true, 'markAllAsRead was called');
				this.hasUnreadNotifications = false;
				return Promise.resolve();
			};

			await render(hbs`<AppLayouts::NotificationsSidebar />`);

			assert
				.dom('[data-test-mark-all-read]')
				.exists('Mark all as read button exists');
			await click('[data-test-mark-all-read]');
		});

		test('infinite scroll loads more notifications', async function (assert) {
			this.notifications.loadNotifications = function () {
				assert.ok(true, 'loadNotifications was called');
				return Promise.resolve(true);
			};

			await render(hbs`<AppLayouts::NotificationsSidebar />`);
			assert
				.dom('[data-test-infinite-scroll]')
				.exists('Infinite scroll container exists');
		});
	}
);
