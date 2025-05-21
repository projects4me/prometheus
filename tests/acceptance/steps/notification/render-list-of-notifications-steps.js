import steps from '../steps';
import { find, findAll, scrollTo } from '@ember/test-helpers';

export const given = function () {
	return [
		{
			'There are $count systemnotifications in system with unread status':
				(assert, ctx) =>
					async function (count) {
						// Create notifications with unread status
						server.createList(
							'systemnotification',
							parseInt(count),
							{
								createdUser: server.schema.users.first().id,
								createdUserName:
									server.schema.users.first().name,
								description: 'Test notification',
								context: {
									userId: server.schema.users.first().id,
									userName: server.schema.users.first().name,
									projectId: server.schema.projects.first().id,
									projectShortcode:
										server.schema.projects.first().shortCode,
									projectName:
										server.schema.projects.first().name,
                                    relatedTo: "project"
								}
							}
						);

						server.schema.systemnotifications
							.all()
							.models.forEach((notification) => {
								let systemnotificationrecipient = server.create('systemnotificationrecipient', {
									userId:
										ctx.currentUser.id ||
										server.schema.users.first().id,
									systemnotificationId: notification.id,
									isRead: '0'
								});

								notification.update({
									recipientRecords: [
										systemnotificationrecipient
									]
								});
							});

						assert.ok(
							true,
							`Created ${count} unread systemnotifications`
						);
					}
		}
	];
};

export const when = function () {
	return [
		{
			'User clicks on notifications icon': (assert, ctx) =>
				async function () {
					await this.owner
						.lookup('service:pub-sub')
						.trigger('toggle-notifications-sidebar');
					assert.ok(true, this.step);
				}
		},
		{
			'User scrolls to the bottom of notifications list': (assert, ctx) =>
				async function () {
					const container = find('[data-test-infinite-scroll]');
					await scrollTo(container, 0, container.scrollHeight);
					assert.ok(true, this.step);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'There are $expectedCount notifications present inside sidebar': (
				assert,
				ctx
			) =>
				async function (expectedCount) {
					const notifications = findAll('[data-test-notification]');
					assert.equal(
						notifications.length,
						parseInt(expectedCount),
						`${expectedCount} notifications are present inside the sidebar`
					);
				}
		},
		{
			'More notifications should be loaded': (assert, ctx) =>
				async function () {
					// After scrolling, we should see more than the initial page of notifications
					const notifications = findAll('[data-test-notification]');
					assert.ok(
						notifications.length > 10,
						'Additional notifications should be loaded after scrolling'
					);
				}
		},
		{
			'User should see empty notifications message': (assert, ctx) =>
				async function () {
					assert
						.dom('[data-test-empty-notifications]')
						.exists(
							'Empty notifications message should be displayed'
						);
					assert
						.dom('[data-test-empty-message]')
						.exists(
							'Empty notifications message text should be visible'
						);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
