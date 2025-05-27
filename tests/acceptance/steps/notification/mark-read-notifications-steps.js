import steps from '../steps';
import { click, find, findAll } from '@ember/test-helpers';

export const when = function () {
	return [
		{
			'User clicks on first unread notification': (assert, ctx) =>
				async function () {
					const unreadNotification = find(
						'[data-test-notification].unread-notification'
					);
					await click(
						unreadNotification.querySelector(
							'[data-test-notification-link]'
						)
					);
					assert.ok(true, this.step);
				}
		},
		{
			'User clicks on mark all as read button': (assert, ctx) =>
				async function () {
					await click('[data-test-mark-all-read]');
					assert.ok(true, this.step);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'The notification should be marked as read': (assert, ctx) =>
				async function () {
					// The notification we clicked should no longer have unread-notification class
					const clickedNotification = find(
						'[data-test-notification]'
					);
					assert
						.dom(clickedNotification)
						.doesNotHaveClass(
							'unread-notification',
							'The clicked notification should be marked as read'
						);
				}
		},
		{
			'All notifications should be marked as read': (assert, ctx) =>
				async function () {
					const unreadNotifications = findAll(
						'[data-test-notification].unread-notification'
					);
					assert.equal(
						unreadNotifications.length,
						0,
						'All notifications should be marked as read'
					);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
