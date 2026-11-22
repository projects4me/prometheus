/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * An open milestone of a workspace: the milestones of its projects that share a name, grouped into one row.
 * Read-only: Gaia computes it from the milestones.
 *
 * @class Workspacemilestone
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class WorkspacemilestoneModel extends Model {

    /**
     * The identifier of the workspace
     *
     * @property workspaceId
     * @type String
     * @for Workspacemilestone
     * @private
     */
    @attr('string') workspaceId;

    /**
     * The name the grouped milestones share
     *
     * @property name
     * @type String
     * @for Workspacemilestone
     * @private
     */
    @attr('string') name;

    /**
     * The number of the workspace's projects that have a milestone of this name
     *
     * @property projectCount
     * @type Number
     * @for Workspacemilestone
     * @private
     */
    @attr('number') projectCount;

    /**
     * The earliest start date of the grouped milestones
     *
     * @property startDate
     * @type String
     * @for Workspacemilestone
     * @private
     */
    @attr('string') startDate;

    /**
     * The latest end date of the grouped milestones
     *
     * @property endDate
     * @type String
     * @for Workspacemilestone
     * @private
     */
    @attr('string') endDate;

    /**
     * The status, in_progress when any of the grouped milestones is, planned otherwise
     *
     * @property status
     * @type String
     * @for Workspacemilestone
     * @private
     */
    @attr('string') status;

    /**
     * The number of issues in the grouped milestones
     *
     * @property issueCount
     * @type Number
     * @for Workspacemilestone
     * @private
     */
    @attr('number') issueCount;

    /**
     * The number of those issues that are done
     *
     * @property doneIssueCount
     * @type Number
     * @for Workspacemilestone
     * @private
     */
    @attr('number') doneIssueCount;

    /**
     * The percentage of the issues that are done
     *
     * @property progress
     * @type Number
     * @for Workspacemilestone
     */
    get progress() {
        return this.issueCount ? Math.round((this.doneIssueCount / this.issueCount) * 100) : 0;
    }
}
