/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { hasValidDates } from 'prometheus/utils/gantt-helpers';

/**
 * This component renders a single milestone row in the Gantt chart
 *
 * @class GanttRow
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class GanttRowComponent extends Component {

    /**
     * Check if the milestone has valid dates
     *
     * @property hasValidDates
     * @type Boolean
     * @for GanttRow
     * @public
     */
    get hasValidDates() {
        return hasValidDates(this.args.milestone);
    }

    /**
     * Get the milestone ID for tracking
     *
     * @property milestoneId
     * @type String
     * @for GanttRow
     * @public
     */
    get milestoneId() {
        return this.args.milestone.id || this.args.milestone.milestoneType;
    }

    /**
     * Get milestone name for display
     *
     * @property milestoneName
     * @type String
     * @for GanttRow
     * @public
     */
    get milestoneName() {
        return this.args.milestone.name;
    }

    /**
     * Get milestone date range string
     * Shows the effective date range based on milestone and issue dates
     *
     * @property dateRange
     * @type String
     * @for GanttRow
     * @public
     */
    get dateRange() {
        if (!this.hasValidDates) {
            return 'No dates set';
        }
        let startDate = this.milestoneBarStartDate;
        let endDate = this.milestoneBarEndDate;
        
        if (!startDate || !endDate) {
            return 'No dates set';
        }
        
        let start = moment(startDate).format('MMM DD, YYYY');
        let end = moment(endDate).format('MMM DD, YYYY');
        return `${start} - ${end}`;
    }

    /**
     * Get issues with valid dates
     *
     * @property validIssues
     * @type Array
     * @for GanttRow
     * @public
     */
    get validIssues() {
        return this.args.milestone.issues.filter(issue => hasValidDates(issue));
    }

    /**
     * Calculate the effective start date for the milestone bar
     * considering the earliest issue start date.
     *
     * @property milestoneBarStartDate
     * @type String
     * @for GanttRow
     * @public
     */
    get milestoneBarStartDate() {
        if (!this.hasValidDates) {
            return null;
        }

        let earliestDate = moment(this.args.milestone.startDate);

        this.validIssues.forEach((issue) => {
            let issueStart = moment(issue.startDate);
            if (issueStart.isBefore(earliestDate)) {
                earliestDate = issueStart;
            }
        });

        return earliestDate.format('YYYY-MM-DD');
    }

    /**
     * Calculate the effective end date for the milestone bar
     * considering the latest issue end date.
     *
     * @property milestoneBarEndDate
     * @type String
     * @for GanttRow
     * @public
     */
    get milestoneBarEndDate() {
        if (!this.hasValidDates) {
            return null;
        }

        let latestDate = moment(this.args.milestone.endDate);

        this.validIssues.forEach((issue) => {
            let issueEnd = moment(issue.endDate);
            if (issueEnd.isAfter(latestDate)) {
                latestDate = issueEnd;
            }
        });

        return latestDate.format('YYYY-MM-DD');
    }

    /**
     * Action to toggle milestone expand/collapse
     *
     * @method toggleMilestone
     * @public
     */
    @action
    toggleMilestone() {
        if (this.args.onToggle) {
            this.args.onToggle(this.milestoneId);
        }
    }

    /**
     * Action to handle keyboard events for milestone toggle
     *
     * @method handleKeyDown
     * @param {Event} event The keyboard event
     * @public
     */
    @action
    handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleMilestone();
        }
    }

    /**
     * Action to handle issue click
     *
     * @method handleIssueClick
     * @param {Object} issue The issue that was clicked
     * @public
     */
    @action
    handleIssueClick(issue) {
        if (this.args.onIssueClick) {
            this.args.onIssueClick(issue);
        }
    }
}
