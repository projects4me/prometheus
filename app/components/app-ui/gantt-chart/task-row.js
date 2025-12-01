/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * This component renders a single task/issue row in the Gantt chart
 *
 * @class TaskRow
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskRowComponent extends Component {
	/**
	 * Get the issue subject for display
	 *
	 * @property issueSubject
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get issueSubject() {
		return this.args.issue.subject || 'Untitled Issue';
	}

	/**
	 * Get the issue number for display
	 *
	 * @property issueNumber
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get issueNumber() {
		return this.args.issue.issueNumber || '';
	}

	/**
	 * Get the issue date range string
	 *
	 * @property dateRange
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get dateRange() {
		let start = moment(this.args.issue.startDate).format('MMM DD');
		let end = moment(this.args.issue.endDate).format('MMM DD');
		return `${start} - ${end}`;
	}

	/**
	 * Get the assignee name or initials
	 *
	 * @property assigneeName
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get assigneeName() {
		if (this.args.issue.assignedTo && this.args.issue.assignedTo.get) {
			let firstName = this.args.issue.assignedTo.get('firstName') || '';
			let lastName = this.args.issue.assignedTo.get('lastName') || '';
			if (firstName && lastName) {
				return `${firstName.charAt(0)}${lastName.charAt(
					0
				)}`.toUpperCase();
			}
		}
		return '';
	}

	/**
	 * Get the priority class for styling
	 *
	 * @property priorityClass
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get priorityClass() {
		let priority = this.args.issue.priority || 'medium';
		return `priority-${priority}`;
	}

	/**
	 * Get the status class for styling
	 *
	 * @property statusClass
	 * @type String
	 * @for TaskRow
	 * @public
	 */
	get statusClass() {
		let status = this.args.issue.status || 'new';
		return `status-${status}`;
	}

	/**
	 * Action to handle issue click
	 *
	 * @method handleClick
	 * @public
	 */
	@action
	handleClick() {
		if (this.args.onIssueClick) {
			this.args.onIssueClick(this.args.issue);
		}
	}

	/**
	 * Action to handle bar drag start
	 *
	 * @method handleDragStart
	 * @public
	 */
	@action
	handleDragStart() {
		if (this.args.onIssueDragStart) {
			this.args.onIssueDragStart(this.args.issue);
		}
	}

	/**
	 * Action to handle bar drag update (during drag)
	 *
	 * @method handleDragUpdate
	 * @param {Number} dragOffset The current drag offset in pixels
	 * @public
	 */
	@action
	handleDragUpdate(dragOffset) {
		if (this.args.onIssueDragUpdate) {
			this.args.onIssueDragUpdate(this.args.issue, dragOffset);
		}
	}

	/**
	 * Action to handle bar drag end
	 *
	 * @method handleDragEnd
	 * @param {Number} daysMoved Number of days the bar was moved
	 * @public
	 */
	@action
	handleDragEnd(daysMoved) {
		if (this.args.onIssueDragEnd) {
			// Calculate new dates based on the number of days moved
			let newStartDate = moment(this.args.issue.startDate)
				.add(daysMoved, 'days')
				.format('YYYY-MM-DD');
			let newEndDate = moment(this.args.issue.endDate)
				.add(daysMoved, 'days')
				.format('YYYY-MM-DD');

			return this.args.onIssueDragEnd(
				this.args.issue,
				newStartDate,
				newEndDate
			);
		}
	}
}
