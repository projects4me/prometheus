/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
    hasValidDates,
    getIssueTree,
    getMilestoneKey,
    getMilestoneBarDates,
    countCompletedIssues,
    getMilestoneState
} from 'prometheus/utils/gantt-helpers';
import { getMilestoneProgress } from 'prometheus/utils/gantt-progress';
import { format as formatDate, now } from 'prometheus/utils/date';

/**
 * This component renders a single milestone row in the Gantt chart, with its issue rows when expanded.
 * `@part="grid"` draws the grid cells (name, state, counts, dates); otherwise it draws the timeline bars, with
 * the milestone label inside the row when `@showLabel` is set (phones, which have no grid).
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
     * The issues as tree rows (`{ issue, depth, hasChildren, isCollapsed }`): children follow their parent, each level ordered by planned start with blockers first
     *
     * @property treeRows
     * @type Array
     * @for GanttRow
     * @public
     */
    get treeRows() {
        const blocksLinks = (this.args.links?.links ?? [])
            .filter((link) => link.type === 'blocks')
            .map((link) => ({
                sourceId: link.belongsTo('sourceIssue').id(),
                targetId: link.belongsTo('targetIssue').id()
            }));
        return getIssueTree(this.args.milestone, this.args.collapsedIssues, { schedule: this.args.schedule, blocksLinks });
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
     * The milestone bar's `{ start, days }` on `@timeAxis`, in day columns; null without an axis (the bar then
     * positions from its dates)
     *
     * @property milestoneSpan
     * @type Object|null
     * @for GanttRow
     * @public
     */
    get milestoneSpan() {
        return this.args.timeAxis?.dateSpan(this.milestoneBarStartDate, this.milestoneBarEndDate) ?? null;
    }

    /**
     * The milestone's % done (finished issues ÷ all issues) for its bar's fill, or null without issues.
     *
     * @property progress
     * @type Number|null
     * @for GanttRow
     * @public
     */
    get progress() {
        return getMilestoneProgress(this.args.milestone);
    }

    /**
     * The label after the milestone bar: its name and, when it has issues, its % done ("name · 43%").
     *
     * @property milestoneLabel
     * @type String
     * @for GanttRow
     * @public
     */
    get milestoneLabel() {
        return this.progress === null ? this.milestoneName : `${this.milestoneName} · ${this.progress}%`;
    }

    /**
     * Number of the milestone's issues that are finished
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
     * Number of the milestone's issues
     *
     * @property totalIssuesCount
     * @type Number
     * @for GanttRow
     * @public
     */
    get totalIssuesCount() {
        return this.args.milestone.issues?.length ?? 0;
    }

    /**
     * The state label of the grid row: `done`, `overdue` or null
     *
     * @property state
     * @type String
     * @for GanttRow
     * @public
     */
    get state() {
        return getMilestoneState(this.args.milestone, formatDate(now(), 'YYYY-MM-DD'));
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
     * Action to collapse or expand an issue's children
     *
     * @method toggleIssue
     * @param {Object} issue The parent issue
     * @public
     */
    @action
    toggleIssue(issue) {
        this.args.onToggleIssue?.(issue.id);
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
