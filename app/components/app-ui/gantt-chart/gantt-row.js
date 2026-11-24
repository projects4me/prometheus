/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { hasValidDates, getValidIssues, countCompletedIssues, getMilestoneKey, getMilestoneBarDates } from 'prometheus/utils/gantt-helpers';

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
        return getMilestoneKey(this.args.milestone);
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
     * Get issues with valid dates
     *
     * @property validIssues
     * @type Array
     * @for GanttRow
     * @public
     */
    get validIssues() {
        return getValidIssues(this.args.milestone);
    }

    /**
     * Get the total number of issues for the milestone
     *
     * @property totalIssuesCount
     * @type Number
     * @for GanttRow
     * @public
     */
    get totalIssuesCount() {
        return this.args.milestone.issues ? this.args.milestone.issues.length : 0;
    }

    /**
     * Get the count of completed issues for the milestone
     * Completed issues include: done, complete, closed, deferred
     *
     * @property completedIssuesCount
     * @type Number
     * @for GanttRow
     * @public
     */
    get completedIssuesCount() {
        return countCompletedIssues(this.args.milestone);
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
        return getMilestoneBarDates(this.args.milestone).start;
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
        return getMilestoneBarDates(this.args.milestone).end;
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

    /**
     * Action to handle issue number link click (opens panel)
     *
     * @method handleOpenIssuePanel
     * @param {Object} issue The issue that was clicked
     * @public
     */
    @action
    handleOpenIssuePanel(issue) {
        if (this.args.onOpenIssuePanel) {
            this.args.onOpenIssuePanel(issue);
        }
    }
}
