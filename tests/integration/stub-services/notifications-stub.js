import Service from '@ember/service';

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

	loadNotifications() {
		return Promise.resolve(true);
	}

	markAllAsRead() {
		this.unreadCount = 0;
		this.hasUnreadNotifications = false;
		return Promise.resolve();
	}
}