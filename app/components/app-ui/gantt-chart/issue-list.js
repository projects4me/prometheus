/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
    getValidIssues,
    countCompletedIssues,
    getMilestoneKey,
    getMilestoneBarDates
} from 'prometheus/utils/gantt-helpers';
import { format } from 'prometheus/utils/date';

/**
 * The issue list of the Gantt: an embedded QuickList of the issues the timeline shows, grouped by milestone
 * in the Gantt's milestone order.
 *
 * Arguments:
 * - `@milestones` {Array}: the Gantt's milestone records, each with its `issues`.
 * - `@activeId` {String|Number}: id of the active issue; when it changes the list expands its group and scrolls
 *   it into view.
 * - `@onSelect` {Function}: called with the issue when its row is clicked.
 * - `@onOpen` {Function}: called with the issue when its eye button is clicked.
 *
 * @class IssueList
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 */
export default class IssueListComponent extends Component {
    /**
     * The milestones that have at least one issue to show
     *
     * @property entries
     * @type Array
     * @private
     */
    get entries() {
        return (this.args.milestones ?? []).map((milestone) => ({
            milestone,
            key: String(getMilestoneKey(milestone)),
            issues: getValidIssues(milestone)
        }));
    }

    /**
     * All listed issues, in milestone order
     *
     * @property issues
     * @type Array
     * @public
     */
    get issues() {
        return this.entries.flatMap((entry) => entry.issues);
    }

    /**
     * The grouping option: the group of an issue is its milestone
     *
     * @property groupOptions
     * @type Array
     * @public
     */
    get groupOptions() {
        let keyOf = new Map();
        this.entries.forEach((entry) => entry.issues.forEach((issue) => keyOf.set(issue, entry.key)));
        return [{
            key: 'milestone',
            label: '',
            groupKey: (issue) => keyOf.get(issue),
            groupLabel: (key) => this.findEntry(key)?.milestone.name ?? key
        }];
    }

    /**
     * Details of a milestone for its group heading
     *
     * @method details
     * @param {String} key The group key
     * @returns {Object} Name, done and total counts and the bar dates
     * @public
     */
    @action
    details(key) {
        let milestone = this.findEntry(key)?.milestone;
        if (!milestone) {
            return {};
        }
        let { start, end } = getMilestoneBarDates(milestone);
        return {
            name: milestone.name,
            done: countCompletedIssues(milestone),
            total: milestone.issues?.length ?? 0,
            start,
            end
        };
    }

    /**
     * @method findEntry
     * @param {String} key
     * @private
     */
    findEntry(key) {
        return this.entries.find((entry) => entry.key === String(key));
    }

    /**
     * A date range as shown in the list, formatted like the `format-date` helper
     *
     * @method range
     * @param {String} start
     * @param {String} end
     * @returns {String} `start - end`
     * @public
     */
    @action
    range(start, end) {
        const show = (date) => (date ? format(date, "DD MMM 'YY") : '-');
        return `${show(start)} - ${show(end)}`;
    }

    /**
     * Report a row click
     *
     * @method select
     * @param {Object} issue
     * @public
     */
    @action
    select(issue) {
        this.args.onSelect?.(issue);
    }

    /**
     * Report an eye button click
     *
     * @method open
     * @param {Object} issue
     * @public
     */
    @action
    open(issue) {
        this.args.onOpen?.(issue);
    }
}
