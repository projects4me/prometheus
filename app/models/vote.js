/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The vote model
 *
 * @class Vote
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class VoteModel extends Model {

    /**
     * Date on which the vote was created
     *
     * @property dateCreated
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the vote was last modified
     *
     * @property dateModified
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user who created the vote
     *
     * @property createdUser
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the use who created the vote
     *
     * @property createdUserName
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the vote
     *
     * @property modifiedUser
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the vote
     *
     * @property modifiedUserName
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The vote flag
     *
     * @property deleted
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') vote;

    /**
     * The identifier of the record this vote is related to
     *
     * @property relatedId
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') relatedId;

    /**
     * The model this vote is related to
     *
     * @property relatedTo
     * @type String
     * @for Vote
     * @private
     */
    @attr('string') relatedTo;

    /**
     * The user who created the vote
     *
     * @property createdBy
     * @type UserModel
     * @for Vote
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who last modified the vote
     *
     * @property modifiedBy
     * @type UserModel
     * @for Vote
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The user who last modified the vote
     *
     * @property wiki
     * @type WikiModel
     * @for Vote
     * @private
     */
    @hasMany('wiki', { async: true, inverse: 'vote' }) wiki;

    /**
     * The user who last modified the vote
     *
     * @property comment
     * @type CommentModel
     * @for Vote
     * @private
     */
    @hasMany('comment', { async: true, inverse: null }) comment;

    /**
     * The user who last modified the vote
     *
     * @property conversationroom
     * @type ConversationRoomModel
     * @for Vote
     * @private
     */
    @hasMany('conversationroom', { async: true, inverse: 'votes' }) conversationroom;

}