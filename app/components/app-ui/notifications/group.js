/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';
import issueLink from '../../../utils/notifications/issue-link';

/**
 * Heading with the issue key and all the notifications of one issue in the notifications sidebar
 *
 * @class AppUiNotificationsGroupComponent
 * @namespace Prometheus.Components.AppUi.Notifications
 * @extends AppComponent
 */
export default class AppUiNotificationsGroupComponent extends AppComponent {
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
	 * Navigates to the issue, never marks anything read
	 *
	 * @method goToIssue
	 * @param {Event} event The click event
	 * @public
	 */
	@action
	goToIssue(event) {
		event.preventDefault();
		if (this.config.app.notifications.enableNav) {
			this.router.transitionTo(this.issueUrl);
		}
	}
}
