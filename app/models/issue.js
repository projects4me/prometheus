/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Issue
 */
const Validations = buildValidations({
    subject: validator('presence', true),
    typeId: validator('presence', true),
    assignee: validator('presence', true),
    owner: validator('presence', true),
    status: validator('presence', true),
    priority: validator('presence', true)
});

/**
 * The issue model
 *
 * @class Issue
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module Issue
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * Subject of the issue
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    subject: DS.attr('string'),

    /**
     * Date on which the issue was created
     *
     * @property dateCreated
     * @type String
     * @for Issue
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the issue was last modified
     *
     * @property dateModified
     * @type String
     * @for Issue
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issue
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Description of the issue
     *
     * @property description
     * @type String
     * @for Issue
     * @private
     */
    description: DS.attr('string'),

    /**
     * Identifier of the create who created the issue
     *
     * @property createdUser
     * @type String
     * @for Issue
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The identifier of the user who is designated as the owner of the issue
     *
     * @property owner
     * @type String
     * @for Issue
     * @private
     */
    owner: DS.attr('string'),

    /**
     * The identifier of the user who is currently the assignee of the issue
     *
     * @property assignee
     * @type String
     * @for Issue
     * @private
     */
    assignee: DS.attr('string'),

    /**
     * The identifier of the user who reported the issue
     *
     * @property reportedUser
     * @type String
     * @for Issue
     * @private
     */
    reportedUser: DS.attr('string'),

    /**
     * The identifier of the user who last modified the issue
     *
     * @property modifiedUser
     * @type String
     * @for Issue
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The number of the issue
     *
     * @property issueNumber
     * @type String
     * @for Issue
     * @private
     */
    issueNumber: DS.attr('string'),

    /**
     * The end data set for the issue
     *
     * @property endDate
     * @type String
     * @for Issue
     * @private
     */
    endDate: DS.attr('string'),

    /**
     * The date on which the issue is set to start
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    startDate: DS.attr('string'),

    /**
     * Status of the issue
     *
     * @property status
     * @type String
     * @for Issue
     * @private
     */
    status: DS.attr('string', { defaultValue: 'new' }),

    /**
     * Priority of the issue
     *
     * @property priority
     * @type String
     * @for Issue
     * @private
     */
    priority: DS.attr('string', { defaultValue: 'medium' }),

    /**
     * The identifier of the project the issue belongs to
     *
     * @property projectId
     * @type String
     * @for Issue
     * @private
     */
    projectId: DS.attr('string'),

    /**
     * The identifier of the conversation room for this issue
     *
     * @property conversationRoomId
     * @type String
     * @for Issue
     * @private
     */
    conversationRoomId: DS.attr('string'),

    /**
     * The identifier of the milestone this issue is set for
     *
     * @property milestoneId
     * @type String
     * @for Issue
     * @private
     */
    milestoneId: DS.attr('string'),

    /**
     * The identifier of the parent of the issue
     *
     * @property parentId
     * @type String
     * @for Issue
     * @private
     */
    parentId: DS.attr('string'),

    /**
     * The identifier of the type this issue belongs to
     *
     * @property typeId
     * @type String
     * @for Issue
     * @private
     */
    typeId: DS.attr('string'),

    /**
     * The user to whom this issue is currently assigned to
     *
     * @property assignedTo
     * @type UserModel
     * @for Issue
     * @private
     */
    assignedTo: DS.belongsTo('user'),

    /**
     * The user who created this issue
     *
     * @property createdBy
     * @type UserModel
     * @for Issue
     * @private
     */
    createdBy: DS.belongsTo('user'),

    /**
     * The user who last modified this issue
     *
     * @property modifiedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    modifiedBy: DS.belongsTo('user'),

    /**
     * The user who is responsible for this issue
     *
     * @property ownedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    ownedBy: DS.belongsTo('user'),

    /**
     * The user who reported this issue
     *
     * @property reportedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    reportedBy: DS.belongsTo('user'),

    /**
     * The project which this issues belongs to
     *
     * @property project
     * @type ProjectModel
     * @for Issue
     * @private
     */
    project: DS.belongsTo('project'),

    /**
     * The milestone which this issue belongs to
     *
     * @property milestone
     * @type MilestoneModel
     * @for Issue
     * @private
     */
    milestone: DS.belongsTo('milestone'),

    /**
     * The parent issue of this issue
     *
     * @property parentissue
     * @type IssueModel
     * @for Issue
     * @private
     */
    parentissue: DS.belongsTo('issue',{inverse:null}),

    /**
     * The type of the issue
     *
     * @property issuetype
     * @type IssuetypeModel
     * @for IssueModel
     * @private
     */
    issuetype: DS.belongsTo('issuetype'),

    /**
     * The estimated time on the issue
     *
     * @property estimated
     * @type Relationship
     * @for Issue
     * @private
     */
    estimated: DS.hasMany('timelog'),

    /**
     * The spent time on the issue
     *
     * @property spent
     * @type Relationship
     * @for Issue
     * @private
     */
    spent: DS.hasMany('timelog'),

    /**
     * The child issues of this issue
     *
     * @property childissues
     * @type IssueModel
     * @for Issue
     * @private
     */
    childissues: DS.hasMany('issue',{inverse:null}),

    /**
     * The comments made on this issue
     *
     * @property comments
     * @type IssueModel
     * @for Issue
     * @private
     */
    comments: DS.hasMany('comment'),

    /**
     * The child issues of this issue
     *
     * @property childissues
     * @type IssueModel
     * @for Issue
     * @private
     */
    activities: DS.hasMany('activity'),

    /**
     * The files uploaded against the issue
     *
     * @property files
     * @type UploadModel
     * @for Issue
     * @private
     */
    files: DS.hasMany('upload'),
});