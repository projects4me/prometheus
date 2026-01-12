/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { next } from '@ember/runloop';

/**
 * This component renders the issue details side panel in the Gantt chart
 *
 * @class IssueDetailsPanel
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssueDetailsPanelComponent extends Component {
	panelElement = null;
	previousIssueId = null;

	/**
	 * Check if the panel is open
	 *
	 * @property isOpen
	 * @type Boolean
	 * @for IssueDetailsPanel
	 * @public
	 */
	get isOpen() {
		return this.args.isOpen && Boolean(this.args.issue);
	}

	/**
	 * Scroll panel container to top with smooth animation
	 *
	 * @method scrollToTop
	 * @private
	 */
	scrollToTop() {
		if (this.panelElement) {
			this.panelElement.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}

	/**
	 * Register panel element and scroll to top when opened
	 *
	 * @method registerPanel
	 * @param {HTMLElement} element The panel element
	 * @public
	 */
	@action
	registerPanel(element) {
		this.panelElement = element;
		if (this.isOpen && this.args.issue) {
			this.previousIssueId = this.args.issue.id;
			next(() => {
				this.scrollToTop();
			});
		}
	}

	/**
	 * Handle issue change and scroll to top when new issue is opened
	 *
	 * @method handleIssueChange
	 * @public
	 */
	@action
	handleIssueChange() {
		const currentIssueId = this.args.issue?.id;
		if (currentIssueId && currentIssueId !== this.previousIssueId && this.isOpen) {
			this.previousIssueId = currentIssueId;
			next(() => {
				this.scrollToTop();
			});
		}
	}

	/**
	 * Action to handle panel close
	 *
	 * @method handleClose
	 * @public
	 */
	@action
	handleClose() {
		this.args.onClose?.();
	}
}

