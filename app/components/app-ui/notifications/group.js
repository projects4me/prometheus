/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import issueLink from '../../../utils/notifications/issue-link';

/**
 * Heading with the issue key and all the notifications of one issue in the notifications sidebar
 *
 * @class AppUiNotificationsGroupComponent
 * @namespace Prometheus.Components.AppUi.Notifications
 * @extends AppComponent
 */
export default class AppUiNotificationsGroupComponent extends AppComponent {
	@service notifications;

	/**
	 * URL of the issue the group belongs to
	 *
	 * @property issueUrl
	 * @type String
	 * @public
	 */
	get issueUrl() {
		return issueLink({
			projectShortcode: this.args.group.shortcode,
			issueNumber: this.args.group.issueNumber
		});
	}

	/**
	 * Marks every unread notification of the issue as read and then navigates to the issue
	 *
	 * @method goToIssue
	 * @param {Event} event The click event
	 * @public
	 * @async
	 */
	@action
	async goToIssue(event) {
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) {
			// Let the browser open the link in a new tab or window; the group is read in the background
			this._markGroupAsRead();
			return;
		}
		event.preventDefault();
		await this._markGroupAsRead();
		if (this.config.app.notifications.enableNav) {
			this.router.transitionTo(this.issueUrl);
		}
	}

	/**
	 * Marks every notification of the group as read, carrying on when one of them fails
	 *
	 * @method _markGroupAsRead
	 * @private
	 * @async
	 */
	async _markGroupAsRead() {
		for (const notification of this.args.group.notifications) {
			try {
				await this.notifications.markAsRead(notification);
			} catch (error) {
				console.error('Error marking notification as read:', error);
			}
		}
	}
}
