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
export default Model.extend({

    /**
     * Name of project
     *
     * @property name
     * @type String
     * @for Project
     * @private
     */
    name: attr('string'),

    /**
     * Short Code of project
     *
     * @property shortCode
     * @type String
     * @for Project
     * @private
     */
    shortCode: attr('string'),

    /**
     * Date on which the project was created
     *
     * @property dateCreated
     * @type String
     * @for Project
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the project was last modified
     *
     * @property dateModified
     * @type String
     * @for Project
     * @private
     */
    dateModified: attr('string'),

    /**
     * The start date of the project
     *
     * @property startDate
     * @type String
     * @for Project
     * @private
     */
    startDate: attr('string'),

    /**
     * The end date of the project
     *
     * @property endDate
     * @type String
     * @for Project
     * @private
     */
    endDate: attr('string'),

    /**
     * Type of the project
     *
     * @property type
     * @type String
     * @for Project
     * @private
     */
    type: attr('string', { defaultValue: 'Kanban' }),

    /**
     * User who last modified the project
     *
     * @property modifiedUser
     * @type String
     * @for Project
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The project owner ot assignee
     *
     * @property assignee
     * @type String
     * @for Project
     * @private
     */
    assignee: attr('string'),

    /**
     * Soft deletion flag of the project
     *
     * @property deleted
     * @type String
     * @for Project
     * @private
     */
    deleted: attr('string'),

    /**
     * Description of the project
     *
     * @property description
     * @type String
     * @for Project
     * @private
     */
    description: attr('string'),

    /**
     * Status of the project
     *
     * @property status
     * @type String
     * @for Project
     * @private
     */
    status: attr('string'),

    /**
     * Scope of the project
     *
     * @property scope
     * @type String
     * @for Project
     * @private
     */
    scope: attr('string'),

    /**
     * Product Vision
     *
     * @property vision
     * @type String
     * @for Project
     * @private
     */
    vision: attr('string'),

    /**
     * User who created the project
     *
     * @property createdUser
     * @type String
     * @for Project
     * @private
     */
    createdUser: attr('string'),

    /**
     * The estimated budget of the project
     *
     * @property estimatedBudget
     * @type String
     * @for Project
     * @private
     */
    estimatedBudget: attr('string'),

    /**
     * The amount of budget spent on the project
     *
     * @property spentBudget
     * @type String
     * @for Project
     * @private
     */
    spentBudget: attr('string'),

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
    done: attr('string'),

    /**
    * Project owner
    *
    * @property owner
    * @type Relationship
    * @for Project
    * @private
    */
    owner: belongsTo('user', { inverse: null }),

    /**
     * User who created the project
     *
     * @property createdBy
     * @type Relationship
     * @for Project
     * @private
     */
    createdBy: belongsTo('user', { inverse: null }),

    /**
     * User who modified the project
     *
     * @property modifiedBy
     * @type Relationship
     * @for Project
     * @private
     */
    modifiedBy: belongsTo('user', { inverse: null }),

    /**
     * The members of this project
     *
     * @property members
     * @type UserModel
     * @for Project
     * @private
     */
    members: hasMany('user', { inverse: null }),

    /**
     * The conversations that are happening on this project
     *
     * @property conversations
     * @type ConversationRoomModel
     * @for Project
     * @private
     */
    conversations: hasMany('conversationroom'),

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
    issues: hasMany('issue'),

    /**
     * The roles related to the members of this project, please note that these
     * roles are not related to the users directly. The API simply returns all
     * the roles as well as the membership rules. The application has to relate the
     * user to the role via the code.
     *
     * @property roles
     * @type RoleModel
     * @for Project
     * @private
     */
    roles: hasMany('role'),

    /**
     * The membership rules for this project.
     *
     * @property memberships
     * @type MembershipModel
     * @for Project
     * @private
     */
    memberships: hasMany('membership'),

    /**
     * The milestones for this project
     *
     * @property milestones
     * @type MilestoneModel
     * @for Project
     * @private
     */
    milestones: hasMany('milestone'),

    /**
     * The issue types for this project
     *
     * @property issuetypes
     * @type IssueTypeModel
     * @for Project
     * @private
     */
    issuetypes: hasMany('issuetype'),

    /**
     * The issue statuses for this project
     *
     * @property issuestatuses
     * @type IssuestatusModel
     * @for Project
     * @private
     */
    issuestatuses: hasMany('issuestatus'),

    /**
     * The activities for this project
     *
     * @property activities
     * @type ActivityModel
     * @for Project
     * @private
     */
    activities: hasMany('activity'),

    /**
     * The issue types for this project
     *
     * @property issuetypes
     * @type IssueTypeModel
     * @for Project
     * @private
     */
    hasIssuetypes: attr('string', { defaultValue: true })

});