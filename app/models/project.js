/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The project model
 *
 * @class Project
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ProjectModel extends Model {

    /**
     * Name of project
     *
     * @property name
     * @type String
     * @for Project
     * @private
     */
    @attr('string') name;

    /**
     * Short Code of project
     *
     * @property shortCode
     * @type String
     * @for Project
     * @private
     */
    @attr('string') shortCode;

    /**
     * Date on which the project was created
     *
     * @property dateCreated
     * @type String
     * @for Project
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the project was last modified
     *
     * @property dateModified
     * @type String
     * @for Project
     * @private
     */
    @attr('string') dateModified;

    /**
     * The start date of the project
     *
     * @property startDate
     * @type String
     * @for Project
     * @private
     */
    @attr('string') startDate;

    /**
     * The end date of the project
     *
     * @property endDate
     * @type String
     * @for Project
     * @private
     */
    @attr('string') endDate;

    /**
     * Type of the project
     *
     * @property type
     * @type String
     * @for Project
     * @private
     */
    @attr('string', { defaultValue: 'Kanban' }) type;

    /**
     * User who last modified the project
     *
     * @property modifiedUser
     * @type String
     * @for Project
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Soft deletion flag of the project
     *
     * @property deleted
     * @type String
     * @for Project
     * @private
     */
    @attr('string') deleted;

    /**
     * Description of the project
     *
     * @property description
     * @type String
     * @for Project
     * @private
     */
    @attr('string') description;

    /**
     * Status of the project
     *
     * @property status
     * @type String
     * @for Project
     * @private
     */
    @attr('string') status;

    /**
     * Id of the workspace the project belongs to
     *
     * @property workspaceId
     * @type String
     * @for Project
     * @private
     */
    @attr('string') workspaceId;

    /**
     * The workspace this project belongs to
     *
     * @property workspace
     * @type Workspace
     * @for Project
     * @private
     */
    @belongsTo('workspace', { async: true, inverse: 'projects' }) workspace;

    /**
     * The number of open issues of the project, computed by Gaia
     *
     * @property openIssueCount
     * @type Number
     * @for Project
     */
    @attr('number') openIssueCount;

    /**
     * When the project joined its workspace, computed by Gaia
     *
     * @property workspaceJoinedAt
     * @type String
     * @for Project
     */
    @attr('string') workspaceJoinedAt;

    /**
     * The number of Talos runs in progress on the project, computed by Gaia
     *
     * @property runsInProgress
     * @type Number
     * @for Project
     */
    @attr('number') runsInProgress;

    /**
     * Id of the active milestone of the project, computed by Gaia, empty without one
     *
     * @property activeMilestoneId
     * @type String
     * @for Project
     */
    @attr('string') activeMilestoneId;

    /**
     * Name of the active milestone of the project, computed by Gaia, empty without one
     *
     * @property activeMilestoneName
     * @type String
     * @for Project
     */
    @attr('string') activeMilestoneName;

    /**
     * Scope of the project
     *
     * @property scope
     * @type String
     * @for Project
     * @private
     */
    @attr('string') scope;

    /**
     * Product Vision
     *
     * @property vision
     * @type String
     * @for Project
     * @private
     */
    @attr('string') vision;

    /**
     * User who created the project
     *
     * @property createdUser
     * @type String
     * @for Project
     * @private
     */
    @attr('string') createdUser;

    /**
     * The estimated budget of the project
     *
     * @property estimatedBudget
     * @type String
     * @for Project
     * @private
     */
    @attr('string') estimatedBudget;

    /**
     * The amount of budget spent on the project
     *
     * @property spentBudget
     * @type String
     * @for Project
     * @private
     */
    @attr('string') spentBudget;

    /**
     * This flag tells us that whether the status is in the done category or not. For example
     * when we have a issue of 'in progress' status then we know that it's not done yet so we
     * feed the value of done to 0 in that case. 
     *
     * @property done
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') done;

    /**
     * Project manager
     *
     * @property projectManager
     * @type String
     * @for Project
     * @private
     */
    @attr('string') projectManager;

    /**
    * Project manager
    *
    * @property manager
    * @type UserModel
    * @for Project
    * @private
    */
    @belongsTo('user', { async: true, inverse: null }) manager;

    /**
     * User who created the project
     *
     * @property createdBy
     * @type Relationship
     * @for Project
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * User who modified the project
     *
     * @property modifiedBy
     * @type Relationship
     * @for Project
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The members of this project
     *
     * @property members
     * @type UserModel
     * @for Project
     * @private
     */
    @hasMany('user', { async: true, inverse: 'projects' }) members;

    /**
     * The conversations that are happening on this project
     *
     * @property conversations
     * @type ConversationRoomModel
     * @for Project
     * @private
     */
    @hasMany('conversationroom', { async: true, inverse: 'project' }) conversations;

    /**
     * These are the issues that are related to the project, since the number of
     * issues related to a project can grow significantly it is advisable that they
     * are not retrieve via the same query as the other project information
     *
     * @property issues
     * @type IssueModel
     * @for Project
     * @private
     */
    @hasMany('issue', { async: true, inverse: 'project' }) issues;

    /**
     * Project memberships
     *
     * @property memberships
     * @type MembershipModel
     * @for Project
     * @private
     */
    @hasMany('membership', { async: true, inverse: 'project' }) memberships;

    /**
     * The milestones for this project
     *
     * @property milestones
     * @type MilestoneModel
     * @for Project
     * @private
     */
    @hasMany('milestone', { async: true, inverse: 'project' }) milestones;

    /**
     * The issue types for this project
     *
     * @property issuetypes
     * @type IssueTypeModel
     * @for Project
     * @private
     */
    @hasMany('issuetype', { async: true, inverse: null }) issuetypes;

    /**
     * The issue statuses for this project
     *
     * @property issuestatuses
     * @type IssuestatusModel
     * @for Project
     * @private
     */
    @hasMany('issuestatus', { async: true, inverse: null }) issuestatuses;

    /**
     * The activities for this project
     *
     * @property activities
     * @type ActivityModel
     * @for Project
     * @private
     */
    @hasMany('activity', { async: true, inverse: 'project' }) activities;

    /**
     * The issue types for this project
     *
     * @property issuetypes
     * @type IssueTypeModel
     * @for Project
     * @private
     */
    @attr('string', { defaultValue: true }) hasIssuetypes;

}