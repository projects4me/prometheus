/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { readOnly } from '@ember/object/computed';

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
    statusId: validator('presence', true),
    priority: validator('presence', true),
    startDate: validator('presence', true),
    endDate: [
        validator('presence', true),
        validator('date', {
            after: readOnly('model.startDate'),
            message: "End date should be greater then start date"
        })
    ]
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
export default Model.extend(Validations, {

    /**
     * Subject of the issue
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    subject: attr('string'),

    /**
     * Date on which the issue was created
     *
     * @property dateCreated
     * @type String
     * @for Issue
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the issue was last modified
     *
     * @property dateModified
     * @type String
     * @for Issue
     * @private
     */
    dateModified: attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issue
     * @private
     */
    deleted: attr('string'),

    /**
     * Description of the issue
     *
     * @property description
     * @type String
     * @for Issue
     * @private
     */
    description: attr('string'),

    /**
     * Identifier of the create who created the issue
     *
     * @property createdUser
     * @type String
     * @for Issue
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who is designated as the owner of the issue
     *
     * @property owner
     * @type String
     * @for Issue
     * @private
     */
    owner: attr('string'),

    /**
     * The identifier of the user who is currently the assignee of the issue
     *
     * @property assignee
     * @type String
     * @for Issue
     * @private
     */
    assignee: attr('string'),

    /**
     * The identifier of the user who reported the issue
     *
     * @property reportedUser
     * @type String
     * @for Issue
     * @private
     */
    reportedUser: attr('string'),

    /**
     * The identifier of the user who last modified the issue
     *
     * @property modifiedUser
     * @type String
     * @for Issue
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The number of the issue
     *
     * @property issueNumber
     * @type String
     * @for Issue
     * @private
     */
    issueNumber: attr('string'),

    /**
     * The end data set for the issue
     *
     * @property endDate
     * @type String
     * @for Issue
     * @private
     */
    endDate: attr('string'),

    /**
     * The date on which the issue is set to start
     *
     * @property subject
     * @type String
     * @for Issue
     * @private
     */
    startDate: attr('string'),

    /**
     * Priority of the issue
     *
     * @property priority
     * @type String
     * @for Issue
     * @private
     */
    priority: attr('string', { defaultValue: 'medium' }),

    /**
     * The identifier of the project the issue belongs to
     *
     * @property projectId
     * @type String
     * @for Issue
     * @private
     */
    projectId: attr('string'),

    /**
     * The identifier of the conversation room for this issue
     *
     * @property conversationRoomId
     * @type String
     * @for Issue
     * @private
     */
    conversationRoomId: attr('string'),

    /**
     * The identifier of the milestone this issue is set for
     *
     * @property milestoneId
     * @type String
     * @for Issue
     * @private
     */
    milestoneId: attr('string'),

    /**
     * The identifier of the parent of the issue
     *
     * @property parentId
     * @type String
     * @for Issue
     * @private
     */
    parentId: attr('string'),

    /**
     * The identifier of the type this issue belongs to
     *
     * @property typeId
     * @type String
     * @for Issue
     * @private
     */
    typeId: attr('string'),

    /**
     * The identifier of the status this issue belongs to
     *
     * @property statusId
     * @type String
     * @for Issue
     * @private
     */
     statusId: attr('string'),

    /**
     * The user to whom this issue is currently assigned to
     *
     * @property assignedTo
     * @type UserModel
     * @for Issue
     * @private
     */
    assignedTo: belongsTo('user'),

    /**
     * The user who created this issue
     *
     * @property createdBy
     * @type UserModel
     * @for Issue
     * @private
     */
    createdBy: belongsTo('user'),

    /**
     * The user who last modified this issue
     *
     * @property modifiedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    modifiedBy: belongsTo('user'),

    /**
     * The user who is responsible for this issue
     *
     * @property ownedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    ownedBy: belongsTo('user'),

    /**
     * The user who reported this issue
     *
     * @property reportedBy
     * @type UserModel
     * @for Issue
     * @private
     */
    reportedBy: belongsTo('user'),

    /**
     * The project which this issues belongs to
     *
     * @property project
     * @type ProjectModel
     * @for Issue
     * @private
     */
    project: belongsTo('project'),

    /**
     * The milestone which this issue belongs to
     *
     * @property milestone
     * @type MilestoneModel
     * @for Issue
     * @private
     */
    milestone: belongsTo('milestone'),

    /**
     * The parent issue of this issue
     *
     * @property parentissue
     * @type IssueModel
     * @for Issue
     * @private
     */
    parentissue: belongsTo('issue', { inverse: null }),
    
    /**
     * The conversation room this issue is associated with
     *
     * @property conversationroom
     * @type ConversationRoomModel
     * @for Issue
     * @private
     */
    conversationroom: belongsTo('conversationroom'),

    /**
     * The type of the issue
     *
     * @property issuetype
     * @type IssuetypeModel
     * @for IssueModel
     * @private
     */
    issuetype: belongsTo('issuetype'),

    /**
     * The status of the issue
     *
     * @property issuestatus
     * @type IssuestatusModel
     * @for IssueModel
     * @private
     */
     issuestatus: belongsTo('issuestatus'),    

    /**
     * The estimated time on the issue
     *
     * @property estimated
     * @type Relationship
     * @for Issue
     * @private
     */
    estimated: hasMany('timelog', { inverse: null }),

    /**
     * The spent time on the issue
     *
     * @property spent
     * @type Relationship
     * @for Issue
     * @private
     */
    spent: hasMany('timelog', { inverse: null }),

    /**
     * The child issues of this issue
     *
     * @property childissues
     * @type IssueModel
     * @for Issue
     * @private
     */
    childissues: hasMany('issue', { inverse: null }),

    /**
     * The comments made on this issue
     *
     * @property comments
     * @type IssueModel
     * @for Issue
     * @private
     */
    comments: hasMany('comment'),

    /**
     * The child issues of this issue
     *
     * @property childissues
     * @type IssueModel
     * @for Issue
     * @private
     */
    activities: hasMany('activity'),

    /**
     * The files uploaded against the issue
     *
     * @property files
     * @type UploadModel
     * @for Issue
     * @private
     */
    files: hasMany('upload')
    
});