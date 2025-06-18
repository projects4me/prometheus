/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from "@ember-data/model";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";

/**
 * The issue model
 *
 * @class Issue
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module Issue
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({
    /**
     * The intl service
     *
     * @property intl
     * @type Service
     * @for Issue
     * @public
     */
    intl: service(),
    /**
     * Subject of the issue
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    subject: attr("string"),

    /**
     * Date on which the issue was created
     *
     * @property dateCreated
     * @type String
     * @for Issue
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the issue was last modified
     *
     * @property dateModified
     * @type String
     * @for Issue
     * @private
     */
    dateModified: attr("string"),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issue
     * @private
     */
    deleted: attr("string"),

    /**
     * Description of the issue
     *
     * @property description
     * @type String
     * @for Issue
     * @private
     */
    description: attr("string"),

    /**
     * Identifier of the create who created the issue
     *
     * @property createdUser
     * @type String
     * @for Issue
     * @private
     */
    createdUser: attr("string"),

    /**
     * The identifier of the user who is designated as the owner of the issue
     *
     * @property owner
     * @type String
     * @for Issue
     * @private
     */
    owner: attr("string"),

    /**
     * The identifier of the user who is currently the assignee of the issue
     *
     * @property assignee
     * @type String
     * @for Issue
     * @private
     */
    assignee: attr("string"),

    /**
     * The identifier of the user who reported the issue
     *
     * @property reportedUser
     * @type String
     * @for Issue
     * @private
     */
    reportedUser: attr("string"),

    /**
     * The identifier of the user who last modified the issue
     *
     * @property modifiedUser
     * @type String
     * @for Issue
     * @private
     */
    modifiedUser: attr("string"),

    /**
     * The number of the issue
     *
     * @property issueNumber
     * @type String
     * @for Issue
     * @private
     */
    issueNumber: attr("string"),

    /**
     * The end data set for the issue
     *
     * @property endDate
     * @type String
     * @for Issue
     * @private
     */
    endDate: attr("string"),

    /**
     * The date on which the issue is set to start
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    startDate: attr("string", {
        defaultValue: () => {
            return moment().format("YYYY-MM-DD");
        }
    }),

    /**
     * Priority of the issue
     *
     * @property priority
     * @type String
     * @for Issue
     * @private
     */
    priority: attr("string", { defaultValue: "medium" }),

    /**
     * The identifier of the project the issue belongs to
     *
     * @property projectId
     * @type String
     * @for Issue
     * @private
     */
    projectId: attr("string"),

    /**
     * The short code of the project the issue belongs to
     *
     * @property projectShortCode
     * @type String
     * @for Issue
     */
    projectShortcode: attr("string"),

    /**
     * The identifier of the conversation room for this issue
     *
     * @property conversationRoomId
     * @type String
     * @for Issue
     * @private
     */
    conversationRoomId: attr("string"),

    /**
     * The identifier of the milestone this issue is set for
     *
     * @property milestoneId
     * @type String
     * @for Issue
     * @private
     */
    milestoneId: attr("string"),

    /**
     * The identifier of the parent of the issue
     *
     * @property parentId
     * @type String
     * @for Issue
     * @private
     */
    parentId: attr("string"),

    /**
     * The identifier of the type this issue belongs to
     *
     * @property typeId
     * @type String
     * @for Issue
     * @private
     */
    typeId: attr("string"),

    /**
     * The status of the issue
     *
     * @property status
     * @type String
     * @for Issue
     * @private
     */
    status: attr("string"),

    /**
     * The identifier of the status this issue belongs to
     *
     * @property statusId
     * @type String
     * @for Issue
     * @private
     */
    statusId: attr("string"),

    /**
     * The issue plan of the issue
     *
     * @property isPlanned
     * @type Boolean
     * @for Issue
     * @private
     */
    isPlanned: attr("bool"),

    /**
     * The issue is reopened flag
     *
     * @property isReopened
     * @type Boolean
     * @for Issue
     * @private
     */
    isReopened: attr("bool"),

    /**
     * The user to whom this issue is currently assigned to
     *
     * @property assignedTo
     * @type UserModel
     * @for Issue
     * @private
     */
    assignedTo: belongsTo("user"),

    /**
     * The user who created this issue
     *
     * @property createdBy
     * @type UserModel
     * @for Issue
     * @private
     */
    createdBy: belongsTo("user"),

    /**
     * The user who last modified this issue
     *
     * @property modifiedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    modifiedBy: belongsTo("user"),

    /**
     * The user who is responsible for this issue
     *
     * @property ownedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    ownedBy: belongsTo("user"),

    /**
     * The user who reported this issue
     *
     * @property reportedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    reportedBy: belongsTo("user"),

    /**
     * The project which this issues belongs to
     *
     * @property project
     * @type ProjectModel
     * @for Issue
     * @private
     */
    project: belongsTo("project"),

    /**
     * The milestone which this issue belongs to
     *
     * @property milestone
     * @type MilestoneModel
     * @for Issue
     * @private
     */
    issuemilestone: belongsTo("milestone"),

    /**
     * The parent issue of this issue
     *
     * @property parentissue
     * @type IssueModel
     * @for Issue
     * @private
     */
    parentissue: belongsTo("issue", { inverse: null }),

    /**
     * The conversation room this issue is associated with
     *
     * @property conversationroom
     * @type ConversationRoomModel
     * @for Issue
     * @private
     */
    conversationroom: belongsTo("conversationroom"),

    /**
     * The type of the issue
     *
     * @property issuetype
     * @type IssuetypeModel
     * @for IssueModel
     * @private
     */
    issuetype: belongsTo("issuetype"),

    /**
     * The status of the issue
     *
     * @property issuestatus
     * @type IssuestatusModel
     * @for IssueModel
     * @private
     */
    issuestatus: belongsTo("issuestatus"),

    /**
     * The estimated time on the issue
     *
     * @property estimated
     * @type Relationship
     * @for Issue
     * @private
     */
    estimated: hasMany("timelog", { inverse: null }),

    /**
     * The spent time on the issue
     *
     * @property spent
     * @type Relationship
     * @for Issue
     * @private
     */
    spent: hasMany("timelog", { inverse: null }),

    /**
     * The child issues of this issue
     *
     * @property childissues
     * @type IssueModel
     * @for Issue
     * @private
     */
    childissues: hasMany("issue", { inverse: null }),

    /**
     * The comments made on this issue
     *
     * @property comments
     * @type IssueModel
     * @for Issue
     * @private
     */
    comments: hasMany("comment"),

    /**
     * The activities of the issue
     *
     * @property activities
     * @type ActivityModel
     * @for Issue
     * @private
     */
    activities: hasMany("activity"),
    

    /**
     * The files uploaded against the issue
     *
     * @property files
     * @type UploadModel
     * @for Issue
     * @private
     */
    files: hasMany("upload"),

    /**
     * The watchers of the issue
     *
     * @property watchers
     * @type IssueWatcherModel
     * @for Issue
     * @private
     */
    watchers: hasMany("issuewatcher"),

    /**
     * The constructor for the issue model. In this we're setting the default status of the issue
     * to new if new issue is being created, project has issue statuses and status is not set.
     */
    init() {
        this._super(...arguments);

        // set the default status to the issue
        if (
            this.isNew &&
            this.project.get("issuestatuses")?.length > 0 &&
            this.statusId === undefined
        ) {
            this.setDefaultStatusToIssue(
                this.project.get("issuestatuses"),
                this,
                "new"
            );
        }
    },

    /**
     * This function is used to set the default status to the issue.
     *
     * @method setDefaultStatusToIssue
     * @param {Array} statuses The list of statuses
     * @param {Object} issue The issue model
     * @param {String} statusName The name of the status to set
     * @returns {void}
     */
    setDefaultStatusToIssue(statuses, issue, statusName) {
        let status = statuses.find((status) => {
            return status.get("name") === statusName.toLowerCase();
        });
        if (status) {
            issue.statusId = status.id;
        }
    },
    /**
     * Computed property that determines which info tag to display for an issue based on priority.
     * Returns the highest priority tag that applies to the issue.
     *
     * @property infoTag
     * @type String|null
     * @for Issue
     * @public
     */
    infoTag: computed(
        'parentissue.status',
        'status',
        'endDate',
        'isReopened',
        'spent.length',
        'description',
        'issuetype.name',
        function() {
            let parentissue = this.parentissue;
            
            // Priority 1: Blocked (when parent issue status is 'in_progress')
            if (parentissue && parentissue.get('status') === 'in_progress') {
                return this.intl.t('views.app.board.infoTags.blocked');
            }

            // Priority 2: Overdue (when issue status is 'new' or 'in_progress' AND issue is past endDate)
            if ((this.status === 'new' || this.status === 'in_progress') && this.isIssueOverdue()) {
                return this.intl.t('views.app.board.infoTags.overdue');
            }
            // Priority 3: Reopened (in all statuses - simplified logic for now)
            if (this.isReopened) {
                return this.intl.t('views.app.board.infoTags.reopened');
            }

            // Priority 4: No Timelogs (when issue status is 'done' AND no spent timelogs exist)
            if (this.status === 'done' && !this.hasTimelogs()) {
                return this.intl.t('views.app.board.infoTags.noTimelogs');
            }

            // Priority 5: Missing Description (when issue status is 'new' or 'in_progress' AND description is empty)
            if ((this.status === 'new' || this.status === 'in_progress') && !this.hasDescription()) {
                return this.intl.t('views.app.board.infoTags.missingDescription');
            }

            // Priority 6: Show Issue Type
            return this.issuetype?.get('name');
        }
    ),

	/**
	 * Checks if an issue is overdue by comparing its endDate with current date.
	 *
	 * @method isIssueOverdue
	 * @returns {Boolean} - True if issue is overdue
	 * @for Issue
	 * @public
	 */
	isIssueOverdue() {
		if (!this.endDate) {
			return false;
		}
		return moment().isAfter(moment(this.endDate));
	},

	/**
	 * Checks if an issue has spent timelogs.
	 *
	 * @method hasTimelogs
	 * @returns {Boolean} - True if issue has timelogs
	 * @for Issue
	 * @public
	 */
	hasTimelogs() {
		return this.spent && this.spent.length > 0;
	},

	/**
	 * Checks if an issue has a meaningful description.
	 *
	 * @method hasDescription
	 * @returns {Boolean} - True if issue has description
	 * @for Issue
	 * @public
	 */
	hasDescription() {
		return this.description && this.description.trim().length > 0;
	},

    /**
     * Dependencies - issues that this issue depends on (predecessors)
     *
     * @property dependencies
     * @type String
     * @for Issue
     * @private
     */
    dependencies: attr('string'),

    /**
     * Calculate the duration of the issue in days
     *
     * @property duration
     * @type Number
     * @for Issue
     * @computed
     */
    get duration() {
        if (!this.startDate || !this.endDate) {
            return 1; // Default to 1 day if dates are missing
        }
        
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(1, diffDays); // Minimum 1 day
    },

    /**
     * Calculate the progress percentage based on status and time spent
     *
     * @property progressPercentage
     * @type Number
     * @for Issue
     * @computed
     */
    get progressPercentage() {
        // If issue has a status, use status-based progress
        if (this.issuestatus && this.issuestatus.get) {
            const status = this.issuestatus.get('name');
            const done = this.issuestatus.get('done');
            
            if (done === '1' || status === 'done' || status === 'closed') {
                return 100;
            } else if (status === 'in-progress' || status === 'testing') {
                return 50;
            } else if (status === 'new' || status === 'open') {
                return 0;
            }
        }

        // Fallback: calculate based on time spent vs estimated
        const estimatedHours = this.estimated.reduce((sum, timelog) => {
            return sum + (parseFloat(timelog.get('hours')) || 0);
        }, 0);
        
        const spentHours = this.spent.reduce((sum, timelog) => {
            return sum + (parseFloat(timelog.get('hours')) || 0);
        }, 0);

        if (estimatedHours > 0) {
            return Math.min(100, Math.round((spentHours / estimatedHours) * 100));
        }

        return 0;
    },

    /**
     * Get the list of dependency issue IDs
     *
     * @property dependencyIds
     * @type Array
     * @for Issue
     * @computed
     */
    get dependencyIds() {
        if (!this.dependencies) {
            return [];
        }
        
        return this.dependencies.split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
    },

    /**
     * Check if this issue is overdue
     *
     * @property isOverdue
     * @type Boolean
     * @for Issue
     * @computed
     */
    get isOverdue() {
        if (!this.endDate) {
            return false;
        }
        
        const today = new Date();
        const endDate = new Date(this.endDate);
        const progress = this.progressPercentage;
        
        return endDate < today && progress < 100;
    },

    /**
     * Get the CSS class for the issue based on its status and priority
     *
     * @property cssClass
     * @type String
     * @for Issue
     * @computed
     */
    get cssClass() {
        let classes = ['gantt-task'];
        
        // Add priority class
        if (this.priority) {
            classes.push(`priority-${this.priority}`);
        }
        
        // Add status class
        if (this.issuestatus && this.issuestatus.get) {
            const status = this.issuestatus.get('name');
            classes.push(`status-${status}`);
        }
        
        // Add overdue class
        if (this.isOverdue) {
            classes.push('overdue');
        }
        
        return classes.join(' ');
    },    
});
