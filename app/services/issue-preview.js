/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';

/**
 * Sends an issue to the open screen that can preview it, such as the task
 * board's quick view. The open screen registers itself on enter and disposes
 * the registration on exit; only one screen is registered at a time.
 *
 * @class IssuePreviewService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class IssuePreviewService extends Service {
	/**
	 * The registration of the screen that is open, `{ owner, hasIssue, open }`
	 *
	 * @property registration
	 * @type Object
	 * @private
	 */
	registration = null;

	/**
	 * Registers the open screen as the issue preview target. A new registration
	 * replaces the previous one. The returned disposer is safe to call more than
	 * once and cannot remove a newer registration.
	 *
	 * @method register
	 * @param {Object} owner The route or controller that owns the preview
	 * @param {Object} handlers `{ hasIssue(issueId), open(issueId) }`
	 * @returns {Function} Disposer that unregisters this owner
	 * @public
	 */
	register(owner, handlers) {
		if (
			!owner ||
			typeof handlers?.hasIssue !== 'function' ||
			typeof handlers?.open !== 'function'
		) {
			throw new Error(
				'Issue preview register requires owner, hasIssue and open'
			);
		}

		let registration = {
			owner,
			hasIssue: handlers.hasIssue,
			open: handlers.open
		};
		this.registration = registration;

		return () => {
			if (this.registration === registration) {
				this.registration = null;
			}
		};
	}

	/**
	 * Opens the issue in the registered screen's preview when that screen
	 * shows the issue.
	 *
	 * @method open
	 * @param {String} issueId Id of the issue to preview
	 * @returns {Boolean} true when the registered screen had the issue and opened it
	 * @public
	 */
	open(issueId) {
		let registration = this.registration;
		if (!registration || issueId == null || issueId === '') {
			return false;
		}
		if (!registration.hasIssue(String(issueId))) {
			return false;
		}
		registration.open(String(issueId));
		return true;
	}
}
