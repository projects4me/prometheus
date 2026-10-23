import Service from '@ember/service';
import groupByIssue from 'prometheus/utils/notifications/group-by-issue';

/**
 * @class NotificationsServiceStub
 * @namespace Prometheus.Tests
 * @extends Ember.Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 * @public
 */
export default class NotificationsStub extends Service {
	notifications = [];
	unreadCount = 0;
	hasUnreadNotifications = false;
	isLoading = false;

	get groupedNotifications() {
		return groupByIssue(this.notifications);
	}

	loadNotifications() {
		return Promise.resolve(true);
	}

	markAsRead(notification) {
		notification.recipientRecords.forEach((record) => {
			record.isRead = '1';
		});
		document
			.querySelector(`[data-notification-id="${notification.id}"]`)
			?.classList.remove('unread-notification');
		return Promise.resolve();
	}

	markAllAsRead() {
		this.unreadCount = 0;
		this.hasUnreadNotifications = false;
		return Promise.resolve();
	}
}