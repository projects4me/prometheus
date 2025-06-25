/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import ENV from 'prometheus/config/environment';

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
	 * @public
	 */
	@service store;

	/**
	 * Current user service for user context
	 * @type {Service}
	 * @public
	 */
	@service currentUser;

	/**
	 * Router service for navigation events
	 * @type {Service}
	 * @public
	 */
	@service router;

	/**
	 * Intl service for internationalization
	 * @type {Service}
	 * @public
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
	 * Track the page size
	 * @type {Number}
	 * @public
	 */
	@tracked pageSize = 15;

	/**
	 * Timer ID for the notification polling interval
	 * @type {Number}
	 * @private
	 */
	_pollingTimerId = null;

	/**
	 * Default interval for polling unread notifications (in milliseconds)
	 * @type {Number}
	 */
	get pollingInterval() {
		return ENV.app.notifications?.pollingInterval || 30000; // fallback to 30 seconds if not configured
	}

	/**
	 * Constructor - sets up route change listener
	 */
	constructor() {
		super(...arguments);
	}

	/**
	 * Loads notifications for the current user
	 * Now focuses only on data fetching, not pagination management
	 *
	 * @method loadNotifications
	 * @param {Object} paginationInfo - Object containing page, pageSize, etc.
	 * @public
	 * @async
	 * @returns {Promise<Object>} Returns object with items and metadata
	 */
	@action
	async loadNotifications(paginationInfo = {}) {
		if (!this.currentUser.user) {
			return { items: [] }; // No hasReachedEnd here
		}

		const { page, pageSize } = paginationInfo;

		try {
			let loadedNotifications = [];

			// Load unread notifications first if beyond page 1
			if (page > 1) {
				const unreadResult = await this.loadUnreadNotifications(
					pageSize
				);
				loadedNotifications = unreadResult.notifications;
			}

			// Load regular paginated notifications
			const paginatedResult = await this.loadPaginatedNotifications(
				page,
				pageSize
			);
			loadedNotifications = [
				...loadedNotifications,
				...paginatedResult.notifications
			];

			this.processLoadedNotifications(
				loadedNotifications,
				paginatedResult.meta
			);

			return {
				items: loadedNotifications,
				meta: paginatedResult.meta
			};
		} catch (error) {
			console.error('Error loading notifications:', error);
			return { items: [] };
		}
	}

	/**
	 * Loads paginated notifications
	 * @method loadPaginatedNotifications
	 * @public
	 * @async
	 * @param {Number} page - Page number
	 * @param {Number} pageSize - Page size
	 * @returns {Promise<Object>} Object containing notifications and metadata
	 */
	async loadPaginatedNotifications(page, pageSize) {
		const options = {
			rels: 'recipientRecords',
			query: `((recipientRecords.userId : ${this.currentUser.user.id}))`,
			sort: 'Systemnotification.dateCreated',
			order: 'desc',
			limit: pageSize,
			page: page
		};

		const userNotifications = await this.store.query(
			'systemnotification',
			options
		);

		return {
			notifications: userNotifications.toArray(),
			meta: userNotifications.meta
		};
	}

	/**
	 * Loads only unread notifications
	 * @method loadUnreadNotifications
	 * @public
	 * @async
	 * @returns {Promise<Object>} Object containing notifications and metadata
	 */
	async loadUnreadNotifications() {
		const options = {
			rels: 'recipientRecords',
			query: `((recipientRecords.userId : ${this.currentUser.user.id}) AND (recipientRecords.isRead : 0))`,
			sort: 'Systemnotification.dateCreated',
			order: 'desc',
			limit: 15
		};

		const unreadNotifications = await this.store.query(
			'systemnotification',
			options
		);

		return {
			notifications: unreadNotifications.toArray()
		};
	}

	/**
	 * Processes loaded notifications and updates the notification array
	 * @method processLoadedNotifications
	 * @public
	 * @param {Array} loadedNotifications New notifications to process
	 * @param {Object} meta Metadata from the API response
	 */
	processLoadedNotifications(loadedNotifications, meta) {
		// Update unread count
		this.unreadCount = meta.unreadCount;

		// If first page, just use the loaded notifications
		if (this.page === 1) {
			this.notifications = loadedNotifications;
			return;
		}

		// For subsequent pages, merge and deduplicate
		const uniqueNotifications =
			this.deduplicateNotifications(loadedNotifications);
		this.notifications = [...this.notifications, ...uniqueNotifications];
		this.sortNotificationsByDate();
	}

	/**
	 * Removes duplicate notifications
	 * @method deduplicateNotifications
	 * @public
	 * @param {Array} newNotifications Notifications to deduplicate
	 * @returns {Array} Deduplicated notifications
	 */
	deduplicateNotifications(newNotifications) {
		return newNotifications.filter(
			(notification) =>
				!this.notifications.find(
					(existing) => existing.id === notification.id
				)
		);
	}

	/**
	 * Sorts notifications by date created (newest first)
	 * @method sortNotificationsByDate
	 * @public
	 */
	sortNotificationsByDate() {
		this.notifications.sort(
			(a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
		);
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

		try {
			const recipientRecord = notification.recipientRecords.find(
				(un) => un.userId === this.currentUser.user.id
			);

			if (recipientRecord && recipientRecord.isRead === '0') {
				recipientRecord.isRead = '1';
				document
					.querySelector(
						`[data-notification-id="${notification.id}"]`
					)
					.classList.remove('unread-notification');
				await recipientRecord.save();
				let response = this.store.adapterFor(
					'systemnotificationrecipient'
				).lastResponseMeta;
				this.unreadCount = response.unreadCount;
			}
		} catch (error) {
			console.error('Error marking notification as read:', error);
			throw error;
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

	/**
	 * Starts polling for new unread notifications at regular intervals
	 *
	 * @method startNotificationPolling
	 * @param {Number} interval Polling interval in milliseconds (defaults to this.pollingInterval)
	 * @public
	 */
	@action
	startNotificationPolling(interval = this.pollingInterval) {
		// Clear any existing timer first to prevent duplicates
		this.stopNotificationPolling();

		// Set up a new polling interval
		this._pollingTimerId = setInterval(() => {
			this.pollUnreadNotifications();
		}, interval);
	}

	/**
	 * Stops polling for new notifications
	 *
	 * @method stopNotificationPolling
	 * @public
	 */
	@action
	stopNotificationPolling() {
		if (this._pollingTimerId !== null) {
			clearInterval(this._pollingTimerId);
			this._pollingTimerId = null;
		}
	}

	/**
	 * Polls for unread notifications and merges them with existing ones
	 * This is called at regular intervals when polling is active
	 *
	 * @method pollUnreadNotifications
	 * @public
	 * @async
	 */
	@action
	async pollUnreadNotifications() {
		if (!this.currentUser.user) {
			return;
		}

		try {
			// Load only unread notifications
			const result = await this.loadUnreadNotifications();
			const unreadNotifications = result.notifications;

			if (unreadNotifications.length > 0) {
				// Update unread count from meta
				this.unreadCount = result.meta.unreadCount;

				// Add unique notifications to the list
				const uniqueNotifications =
					this.deduplicateNotifications(unreadNotifications);

				if (uniqueNotifications.length > 0) {
					this.notifications = [
						...uniqueNotifications,
						...this.notifications
					];
					this.sortNotificationsByDate();
				}
			}
		} catch (error) {
			console.error('Error polling for unread notifications:', error);
		}
	}
}
