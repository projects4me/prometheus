/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';

/**
 * This component renders the issue quick view as a side column next to the Gantt chart, with the Task Board's
 * divider to collapse it. The chart decides when to use it instead of the bottom sheet.
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
	 * The id of the issue whose quick view the divider collapsed. Opening another issue shows its details again.
	 *
	 * @property collapsedIssueId
	 * @type String|null
	 * @for IssueDetailsPanel
	 * @private
	 */
	@tracked collapsedIssueId = null;

	/**
	 * Whether the divider has collapsed the quick view of the open issue
	 *
	 * @property isCollapsed
	 * @type Boolean
	 * @for IssueDetailsPanel
	 * @public
	 */
	get isCollapsed() {
		return this.collapsedIssueId !== null && this.collapsedIssueId === this.args.issue?.id;
	}

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
		if (this.isDestroying || this.isDestroyed) {
			return;
		}
		if (this.panelElement?.isConnected) {
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
	 * The divider: collapses the quick view to a strip so the chart takes the width, or expands it again
	 *
	 * @method toggleCollapse
	 * @public
	 */
	@action
	toggleCollapse() {
		this.collapsedIssueId = this.isCollapsed ? null : (this.args.issue?.id ?? null);
	}

	/**
	 * Action to handle panel close
	 *
	 * @method handleClose
	 * @public
	 */
	@action
	handleClose() {
		this.collapsedIssueId = null;
		this.args.onClose?.();
	}
}

