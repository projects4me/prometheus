/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Collapsible group of the notifications of one issue in the notifications sidebar
 *
 * @class AppUiNotificationsGroupComponent
 * @namespace Prometheus.Components.AppUi.Notifications
 * @extends Glimmer.Component
 */
export default class AppUiNotificationsGroupComponent extends Component {
	/**
	 * Whether the group is expanded, collapsed by default
	 *
	 * @property isExpanded
	 * @type Boolean
	 * @public
	 */
	@tracked isExpanded = false;

	/**
	 * The newest notification of the group
	 *
	 * @property newest
	 * @type Object
	 * @public
	 */
	get newest() {
		return this.args.group.notifications[0];
	}

	/**
	 * Number of unread notifications in the group
	 *
	 * @property unreadCount
	 * @type Number
	 * @public
	 */
	get unreadCount() {
		return this.args.group.notifications.filter(
			(notification) =>
				notification.recipientRecords?.firstObject?.isRead === '0'
		).length;
	}

	/**
	 * Toggles the expanded state, never marks anything read
	 *
	 * @method toggle
	 * @public
	 */
	@action
	toggle() {
		this.isExpanded = !this.isExpanded;
	}

	/**
	 * Lets keyboard users toggle the group with Enter or Space
	 *
	 * @method onKeyDown
	 * @param {KeyboardEvent} event
	 * @public
	 */
	@action
	onKeyDown(event) {
		if (event.target !== event.currentTarget) {
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.toggle();
		}
	}
}
