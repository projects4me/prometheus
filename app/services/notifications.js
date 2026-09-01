/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { peekOrPush, pushIfMissing } from 'prometheus/utils/live/collection';

/**
 * Service for managing user notifications, including Hermes live sync for
 * `notification.created` scoped to `user:<currentUser.id>`.
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
	 * Hermes service for V2 intent-based live events.
	 * @type {Service}
	 * @public
	 */
	@service hermes;

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
	 * Whether the V2 intent registration is active.
	 * @type {Boolean}
	 * @private
	 */
	_liveStarted = false;

	/**
	 * Disposer returned by hermes.register(); call to unsubscribe.
	 * @type {Function|null}
	 * @private
	 */
	_hermesDisposer = null;

	/**
	 * Constructor - initializes the BroadcastChannel for cross-tab sync
	 */
	constructor() {
		super(...arguments);
		this._broadcastChannel = new BroadcastChannel('notifications_sync');
		this._broadcastChannel.onmessage = (event) =>
			this._handleCrossTabMessage(event.data);
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
					?.classList.remove('unread-notification');
				await recipientRecord.save();
				let response = this.store.adapterFor(
					'systemnotificationrecipient'
				).lastResponseMeta;
				this.unreadCount = response.unreadCount;

				this._broadcastChannel.postMessage({
					type: 'MARK_AS_READ',
					notificationId: notification.id,
					unreadCount: this.unreadCount
				});
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

			this._broadcastChannel.postMessage({ type: 'MARK_ALL_AS_READ' });

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
	 * Registers a V2 Hermes intent for `notification.created` scoped to the
	 * current user. The scope key `user:<userId>` is placed in the projectId
	 * field so that the existing room convention routes only to this socket.
	 *
	 * @method startLiveSync
	 * @public
	 */
	@action
	startLiveSync() {
		if (this._liveStarted) {
			return;
		}

		let userId = this.currentUser.user?.id;
		if (!userId) {
			return;
		}

		this._hermesDisposer = this.hermes.register(
			this,
			'user:' + userId,
			{
				'notification.created': (envelope) => {
					this.onNotificationCreated(envelope);
				}
			}
		);
		this._liveStarted = true;
	}

	/**
	 * Disposes the V2 intent registration.
	 *
	 * @method stopLiveSync
	 * @public
	 */
	@action
	stopLiveSync() {
		if (this._hermesDisposer) {
			this._hermesDisposer();
			this._hermesDisposer = null;
		}
		this._liveStarted = false;
	}

	/**
	 * Handles an incoming V2 `notification.created` domain event from Hermes.
	 * Maps the V2 envelope fields to the existing prepend/unread logic.
	 *
	 * Envelope shape:
	 *   { schemaVersion, eventId, eventName, projectId, resource: { type, id },
	 *     changes, meta: { recipientId, recipientUserId, actorName }, actorId }
	 *
	 * @method onNotificationCreated
	 * @param {Object} envelope
	 * @public
	 */
	onNotificationCreated(envelope) {
		if (!envelope || !envelope.resource?.id) {
			return;
		}

		let notificationId = envelope.resource.id;

		if (this.notifications.find((existing) => existing.id === notificationId)) {
			return;
		}

		// backend stores context as a JSON string; REST loads parse it via @attr('json'),
		// but live peekOrPush bypasses the serializer — normalize here so TagParser
		// can resolve {{User@}} / {{Issue@}} from userName / issueNumber.
		let changes = Object.assign({}, envelope.changes || {});
		if (typeof changes.context === 'string') {
			try {
				changes.context = JSON.parse(changes.context);
			} catch (e) {
				// leave as-is if malformed
			}
		}

		let notification = peekOrPush(
			this.store,
			'systemnotification',
			notificationId,
			changes
		);
		if (!notification) {
			return;
		}

		let recipientId = envelope.meta?.recipientId;
		if (recipientId) {
			let recipient = peekOrPush(
				this.store,
				'systemnotificationrecipient',
				recipientId,
				{
					systemNotificationId: notificationId,
					userId: this.currentUser.user?.id,
					isRead: '0'
				}
			);
			pushIfMissing(notification.recipientRecords, recipient);
		}

		this.notifications = [notification, ...this.notifications];
		this.unreadCount = this.unreadCount + 1;
	}

	/**
	 * Handles messages received from other tabs via BroadcastChannel.
	 * Mirrors state updates locally without re-calling the API.
	 *
	 * @method _handleCrossTabMessage
	 * @private
	 * @param {Object} data - Message payload from another tab
	 */
	_handleCrossTabMessage(data) {
		if (data.type === 'MARK_ALL_AS_READ') {
			this.notifications.forEach((notification) => {
				const recipientRecord = notification.recipientRecords.find(
					(un) => un.userId === this.currentUser.user?.id
				);
				if (recipientRecord) {
					recipientRecord.isRead = '1';
				}
			});

			document.querySelectorAll('.unread-notification').forEach((el) => {
				el.classList.remove('unread-notification');
			});

			this.unreadCount = 0;
		} else if (data.type === 'MARK_AS_READ') {
			const notification = this.notifications.find(
				(n) => n.id === data.notificationId
			);

			if (notification) {
				const recipientRecord = notification.recipientRecords.find(
					(un) => un.userId === this.currentUser.user?.id
				);
				if (recipientRecord) {
					recipientRecord.isRead = '1';
				}

				document
					.querySelector(
						`[data-notification-id="${data.notificationId}"]`
					)
					?.classList.remove('unread-notification');
			}

			this.unreadCount = data.unreadCount ?? Math.max(0, this.unreadCount - 1);
		}
	}

	/**
	 * Cleans up the BroadcastChannel and live listener when the service is destroyed
	 *
	 * @method willDestroy
	 * @public
	 */
	willDestroy() {
		super.willDestroy(...arguments);
		this._broadcastChannel?.close();
		this.stopLiveSync();
	}
}
