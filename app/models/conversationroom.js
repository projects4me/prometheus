/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo,hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Conversationroom
 */
const Validations = buildValidations({
    subject: validator('presence', true),
    description: validator('presence', true),
    roomType: validator('presence', true),
    projectId: validator('presence', true),
});

/**
 * The conversation room model
 *
 * @class Conversationroom
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * Subject of the conversation room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    subject: attr('string'),

    /**
     * Date on which the conversation room was created on
     *
     * @property dateCreated
     * @type String
     * @for Conversationroom
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the conversation room was last modified
     *
     * @property dateModified
     * @type String
     * @for Conversationroom
     * @private
     */
    dateModified: attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Conversationroom
     * @private
     */
    deleted: attr('string'),

    /**
     * Description of the conversation room
     *
     * @property description
     * @type String
     * @for Conversationroom
     * @private
     */
    description: attr('string'),

    /**
     * The identifier of the user who created the room
     *
     * @property createdUser
     * @type String
     * @for Conversationroom
     * @private
     */
    createdUser: attr('string'),

    /**
     * The name of the user who created the room
     *
     * @property createdUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    createdUserName: attr('string'),

    /**
     * The name of the user who last modified the room
     *
     * @property modifiedUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The identifier of the user who last modified the room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * Type of conversation room e.g. vote, discussion
     *
     * @property roomType
     * @type String
     * @for Conversationroom
     * @private
     */
    roomType: attr('string'),

    /**
     * The identifier of the project that this room belongs to
     *
     * @property projectId
     * @type String
     * @for Conversationroom
     * @private
     */
    projectId: attr('string'),

    /**
     * The identifier of the issue that this room belongs to
     *
     * @property issueId
     * @type String
     * @for Conversationroom
     * @private
     */
    issueId: attr('string'),

    /**
     * The user who created the room
     *
     * @property createdBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    createdBy: belongsTo('user'),

    /**
     * The user who modified the room
     *
     * @property modifiedBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    modifiedBy: belongsTo('user'),

    /**
     * The project this room belongs to
     *
     * @property project
     * @type Relationship
     * @for Conversationroom
     * @private
     */
    project: belongsTo('project'),

    /**
     * Comments made on this conversation room
     *
     * @property comments
     * @type Relationship
     * @for Conversationroom
     * @private
     */
    comments: hasMany('comment'),

    /**
     * Votes made on this conversation room
     *
     * @property votes
     * @type VoteModel
     * @for Conversationroom
     * @private
     */
    votes: hasMany('vote')

});