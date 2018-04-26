/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The conversation room model
 *
 * @class Conversationroom
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * Subject of the conversation room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    subject: DS.attr('string'),

    /**
     * Date on which the conversation room was created on
     *
     * @property dateCreated
     * @type String
     * @for Conversationroom
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the conversation room was last modified
     *
     * @property dateModified
     * @type String
     * @for Conversationroom
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Conversationroom
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Description of the conversation room
     *
     * @property description
     * @type String
     * @for Conversationroom
     * @private
     */
    description: DS.attr('string'),

    /**
     * The identifier of the user who created the room
     *
     * @property createdUser
     * @type String
     * @for Conversationroom
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The name of the user who created the room
     *
     * @property createdUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The name of the user who last modified the room
     *
     * @property modifiedUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    modifiedUserName: DS.attr('string'),

    /**
     * The identifier of the user who last modified the room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * Type of conversation room e.g. vote, discussion
     *
     * @property roomType
     * @type String
     * @for Conversationroom
     * @private
     */
    roomType: DS.attr('string'),

    /**
     * The identifier of the project that this room belongs to
     *
     * @property projectId
     * @type String
     * @for Conversationroom
     * @private
     */
    projectId: DS.attr('string'),

    /**
     * The identifier of the issue that this room belongs to
     *
     * @property issueId
     * @type String
     * @for Conversationroom
     * @private
     */
    issueId: DS.attr('string'),

    /**
     * The user who created the room
     *
     * @property createdBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    createdBy:DS.belongsTo('user'),

    /**
     * The user who modified the room
     *
     * @property modifiedBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    modifiedBy:DS.belongsTo('user'),

    /**
     * The project this room belongs to
     *
     * @property project
     * @type Relationship
     * @for Conversationroom
     * @private
     */
    project:DS.belongsTo('project'),

    /**
     * Comments made on this conversation room
     *
     * @property comments
     * @type Relationship
     * @for Conversationroom
     * @private
     */
    comments: DS.hasMany('comment'),

    /**
     * Votes made on this conversation room
     *
     * @property votes
     * @type VoteModel
     * @for Conversationroom
     * @private
     */
    votes: DS.hasMany('vote')

});