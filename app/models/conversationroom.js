/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo,hasMany } from '@ember-data/model';

/**
 * The conversation room model
 *
 * @class Conversationroom
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ConversationroomModel extends Model {

    /**
     * Subject of the conversation room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') subject;

    /**
     * Date on which the conversation room was created on
     *
     * @property dateCreated
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the conversation room was last modified
     *
     * @property dateModified
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') dateModified;

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') deleted;

    /**
     * Description of the conversation room
     *
     * @property description
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') description;

    /**
     * The identifier of the user who created the room
     *
     * @property createdUser
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the room
     *
     * @property createdUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The name of the user who last modified the room
     *
     * @property modifiedUserName
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The identifier of the user who last modified the room
     *
     * @property subject
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Type of conversation room e.g. vote, discussion
     *
     * @property roomType
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') roomType;

    /**
     * The identifier of the project that this room belongs to
     *
     * @property projectId
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') projectId;

    /**
     * The identifier of the issue that this room belongs to
     *
     * @property issueId
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') issueId;

    /**
     * The shortcode of the project that this room belongs to
     *
     * @property projectShortcode
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') projectShortcode;

    /**
     * The number of the issue that this room belongs to
     *
     * @property issueNumber
     * @type String
     * @for Conversationroom
     * @private
     */
    @attr('string') issueNumber;
    
    /**
     * The user who created the room
     *
     * @property createdBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who modified the room
     *
     * @property modifiedBy
     * @type UserModel
     * @for Conversationroom
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The project this room belongs to
     *
     * @property project
     * @type ProjectModel
     * @for Conversationroom
     * @private
     */
    @belongsTo('project', { async: true, inverse: 'conversations' }) project;

    /**
     * The issue this room belongs to
     *
     * @property issue
     * @type IssueModel
     * @for Conversationroom
     * @private
     */
    @belongsTo('issue', { async: true, inverse: 'conversationroom' }) issue;

    /**
     * Comments made on this conversation room
     *
     * @property comments
     * @type CommentModel
     * @for Conversationroom
     * @private
     */
    @hasMany('comment', { async: true, inverse: 'conversationRoom' }) comments;

    /**
     * Votes made on this conversation room
     *
     * @property votes
     * @type VoteModel
     * @for Conversationroom
     * @private
     */
    @hasMany('vote', { async: true, inverse: 'conversationroom' }) votes;

}