/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

/**
 * Service for managing user notifications
 *
 * @class NotificationsService
 * @extends Service
 * @public
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class NotificationsService extends Service {
	/**
	 * Store service for data operations
	 * @type {Service}
	 * @private
	 */
	@service store;

	/**
	 * Current user service for user context
	 * @type {Service}
	 * @private
	 */
	@service currentUser;

	/**
	 * Router service for navigation events
	 * @type {Service}
	 * @private
	 */
	@service router;

	/**
	 * Intl service for internationalization
	 * @type {Service}
	 * @private
	 */
	@service intl;

	/**
	 * Array of user notifications
	 * @type {Array}
	 * @public
	 */
	@tracked notifications = [];

	/**
	 * Count of unread notifications
	 * @type {Number}
	 * @public
	 */
	@tracked unreadCount = 0;

	/**
	 * Page number for pagination
	 * @type {Number}
	 * @public
	 */
	@tracked page = 1;

	/**
	 * Indicates if the last page has been reached
	 * @type {Boolean}
	 * @public
	 */
	@tracked isLastPage = false;

	/**
	 * Indicates if notifications are currently being loaded
	 * @type {Boolean}
	 * @public
	 */
	@tracked isLoading = false;

	/**
	 * Indicates if slimscroll should be rendered
	 * @type {Boolean}
	 * @public
	 */
	@tracked renderSlimScroll = false;

	/**
	 * Constructor - sets up route change listener
	 */
	constructor() {
		super(...arguments);
		this.router.on('routeDidChange', () => {
			this.loadNotifications();
		});
	}

	/**
	 * Loads notifications for the current user
	 * Fetches notifications with pagination
	 *
	 * @method loadNotifications
	 * @param {Boolean} reset Whether to reset pagination and load from first page
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async loadNotifications(reset = false) {
		if (!this.currentUser.user) {
			return false;
		}

		if (reset) {
			this.page = 1;
			this.notifications = [];
			this.isLastPage = false;
		}

		if (this.isLoading || this.isLastPage) {
			return false;
		}

		this.isLoading = true;
		this.renderSlimScroll = false;
		try {
			const pageSize = 10;
			let options = {
				rels: 'recipientRecords',
				query: `((recipientRecords.userId : ${this.currentUser.user.id}))`,
				sort: 'Systemnotification.dateCreated',
				order: 'desc',
				limit: pageSize,
				page: this.page
			};

			// Get the query result
			const userNotifications = await this.store.query(
				'systemnotification',
				options
			);

			// Ensure we're working with an array - Ember Data might return a RecordArray
			// which doesn't always spread properly
			const notificationsArray = userNotifications
				? Array.isArray(userNotifications)
					? userNotifications
					: userNotifications.toArray()
				: [];

			// If we got fewer results than requested, we've reached the end
			this.isLastPage = notificationsArray.length < pageSize;

			// Add new notifications to the existing array - safely
			this.notifications = [...this.notifications, ...notificationsArray];

			this.calculateUnreadCount();
			this.page++;
			this.renderSlimScroll = true;
			return !this.isLastPage;
		} catch (error) {
			console.error('Error loading notifications:', error);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Calculates the number of unread notifications
	 * Updates the unreadCount tracked property
	 *
	 * @method calculateUnreadCount
	 * @public
	 */
	@action
	calculateUnreadCount() {
		let count = 0;

		this.notifications.forEach((notification) => {
			const userNotification = notification.recipientRecords.find(
				(un) => un.userId === this.currentUser.user.id
			);

			if (userNotification && userNotification.isRead === '0') {
				count++;
			}
		});
		this.unreadCount = count;
	}

	/**
	 * Marks a notification as read
	 * Updates the UI and recalculates unread count
	 *
	 * @method markAsRead
	 * @public
	 * @async
	 * @param {Object} notification - The notification to mark as read
	 * @returns {Promise<void>}
	 */
	@action
	async markAsRead(notification) {
		if (!notification) return;

		const recipientRecord = notification.recipientRecords.find(
			(un) => un.userId === this.currentUser.user.id
		);

		if (recipientRecord && recipientRecord.isRead === '0') {
			recipientRecord.isRead = '1';
			document
			.querySelector(`[data-notification-id="${notification.id}"]`)
			.classList.remove('unread-notification');
			await recipientRecord.save();
			this.calculateUnreadCount();
		}
	}

	/**
	 * Indicates if the user has any unread notifications
	 * @type {Boolean}
	 * @public
	 */
	get hasUnreadNotifications() {
		return this.unreadCount > 0;
	}

	/**
	 * Marks all notifications as read by calling a REST endpoint
	 * Updates the UI after successful response
	 *
	 * @method markAllAsRead
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async markAllAsRead() {
		let messenger = new Messenger().post({
			message: htmlSafe(
				this.intl.t('views.app.notifications.markingAllAsRead')
			),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});
		try {
			// Get the adapter for systemnotification model to access the REST API
			const adapter = this.store.adapterFor(
				'systemnotificationrecipient'
			);

			// Use adapter's ajax method instead of raw fetch
			await adapter.ajax(
				`${adapter.host}/${adapter.namespace}/systemnotificationrecipient`,
				'POST',
				{
					data: {
						markAllAsRead: true,
						userId: this.currentUser.user.id
					}
				}
			);

			// Update local state - mark all loaded notifications as read
			this.notifications.forEach((notification) => {
				const recipientRecord = notification.recipientRecords.find(
					(un) => un.userId === this.currentUser.user.id
				);

				if (recipientRecord) {
					recipientRecord.isRead = '1';
				}
			});

			// Update UI - remove unread-notification class from all notification elements
			document.querySelectorAll('.unread-notification').forEach((el) => {
				el.classList.remove('unread-notification');
			});

			// Update the unread count
			this.unreadCount = 0;

			messenger.update({
				message: htmlSafe(
					this.intl.t('views.app.notifications.markAllAsReadSuccess')
				),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
		} catch (error) {
			messenger.update({
				message: htmlSafe(
					this.intl.t('views.app.notifications.markAllAsReadError')
				),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			console.error('Error marking all notifications as read:', error);
		}
	}
}
