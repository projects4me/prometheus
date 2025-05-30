/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Component for rendering individual notification items in the notifications sidebar
 *
 * @class AppUiNotificationsNotificationComponent
 * @namespace Prometheus.Components.AppUi.Notifications
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiNotificationsNotificationComponent extends AppComponent {
	/**
	 * The notifications service for managing notification state
	 *
	 * @property notifications
	 * @type Services
	 * @public
	 */
	@service notifications;

	/**
	 * Map of module link generators - each generator function creates a link for a specific module type
	 *
	 * @property linkGenerators
	 * @type Object
	 * @public
	 */
	linkGenerators = {
		issue: this.generateIssueLink,
		project: this.generateProjectLink,
		user: this.generateUserLink,
		comment: this.generateIssueSubModulesLink,
		timelog: this.generateIssueSubModulesLink,
		milestone: this.generateProjectSubModulesLink
	};

	/**
	 * Gets the appropriate link URL for the notification
	 *
	 * @property getNotificationLink
	 * @type String
	 * @public
	 */
	get getNotificationLink() {
		return this.getRouteUrl(this.args.notification);
	}

	/**
	 * Generates the route URL based on notification context
	 *
	 * @method getRouteUrl
	 * @param {Object} notification The notification object
	 * @return {String|null} URL for the notification or null if not applicable
	 * @public
	 */
	getRouteUrl(notification) {
		if (!notification || !notification.context) {
			return null;
		}

		const context = notification.context;
		const relatedTo = context.relatedTo?.toLowerCase();

		if (!relatedTo || !this.linkGenerators[relatedTo]) {
			return null;
		}

		return this.linkGenerators[relatedTo].call(this, context);
	}

	/**
	 * Generates a link to an issue
	 *
	 * @method generateIssueLink
	 * @param {Object} context Notification context
	 * @return {String} URL to the issue
	 * @public
	 */
	generateIssueLink(context) {
		if (!context.projectShortcode || !context.issueNumber) {
			return null;
		}
		return `/app/project/${context.projectShortcode.toLowerCase()}/issue/${
			context.issueNumber
		}`;
	}

	/**
	 * Generates a link to a project
	 *
	 * @method generateProjectLink
	 * @param {Object} context Notification context
	 * @return {String} URL to the project
	 * @public
	 */
	generateProjectLink(context) {
		if (!context.projectShortcode) {
			return null;
		}
		return `/app/project/${context.projectShortcode.toLowerCase()}`;
	}

	/**
	 * Generates a link to a user
	 *
	 * @method generateUserLink
	 * @param {Object} context Notification context
	 * @return {String} URL to the user
	 * @public
	 */
	generateUserLink(context) {
		if (!context.userId) {
			return null;
		}
		return `/app/user/${context.userId}`;
	}

	/**
	 * Generates a link to a comment or timelog within an issue
	 *
	 * @method generateIssueSubModulesLink
	 * @param {Object} context Notification context
	 * @return {String} URL to the comment/timelog
	 * @public
	 */
	generateIssueSubModulesLink(context) {
		let subModulesMap = {
			comment: 'commentId',
			timelog: 'timelogId'
		};
		let subModuleId = context[subModulesMap[context.relatedTo]];
		if (!context.projectShortcode || !context.issueNumber || !subModuleId) {
			return null;
		}
		return `/app/project/${context.projectShortcode}/issue/${context.issueNumber}?s_id=${subModuleId}`;
	}

	/**
	 * Generates a link to a project sub-module (e.g. milestone)
	 *
	 * @method generateProjectSubModulesLink
	 * @param {Object} context Notification context
	 * @return {String} URL to the project sub-module
	 * @public
	 */
	generateProjectSubModulesLink(context) {
		let subModulesMap = {
			milestone: 'milestoneId'
		};
		let subModuleId = context[subModulesMap[context.relatedTo]];
		if (!context.projectShortcode || !subModuleId) {
			return null;
		}
		return `/app/project/${context.projectShortcode}?s_id=${subModuleId}`;
	}

	/**
	 * Marks the notification as read and then navigates
	 *
	 * @method markAsRead
	 * @param {Event} event The click event
	 * @public
	 */
	@action
	async markAsRead(event) {
		// Prevent default browser navigation
		event.preventDefault();
		let link = this.getLink(event.target);
		await this.notifications.markAsRead(this.args.notification);

        // In test environment, we don't want to navigate to the link
		if (this.config.app.notifications.enableNav) {
			this.router.transitionTo(link);
		}
	}

	/**
	 * Gets the appropriate link for the notification based on the clicked element
	 *
	 * @method getLink
	 * @param {HTMLElement} element The element that was clicked
	 * @return {String} The URL to navigate to
	 * @public
	 */
	getLink(element) {
		let link = null;
		if (element.tagName === 'A') {
			link = element.getAttribute('href');
		}
		if (element.tagName === 'IMG' && element.classList.contains('user-image')) {
			link = element.parentElement.getAttribute('href');
		}
		if (!link) {
			link = this.getNotificationLink;
		}
		return link;
	}
}
