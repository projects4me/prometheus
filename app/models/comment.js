/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo } from '@ember-data/model';

/**
 * The comment model
 *
 * @class Comment
 * @namespace Prometheus.Models
 * @extend DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class CommentModel extends Model {

    /**
     * The date on which the comment was created
     *
     * @property dateCreated
     * @type String
     * @for Comment
     * @private
     */
    @attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}) dateCreated;

    /**
     * The date on which the comment was last modified
     *
     * @property dateModified
     * @type String
     * @for Comment
     * @private
     */
    @attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}) dateModified;

    /**
     * The soft deletion flag of the comment
     *
     * @property deleted
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') deleted;

    /**
     * The comment
     *
     * @property comment
     * @type String
     * @for CommentModel
     * @private
     */
    @attr('string') comment;

    /**
     * The identifier of the user who created the comment
     *
     * @property createdUser
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the comment
     *
     * @property createdUserName
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the comment
     *
     * @property modifiedUser
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the comment
     *
     * @property modifiedUserName
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The entity the comment is related to
     *
     * @property relatedTo
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') relatedTo;

    /**
     * The identifier of the record the comment is related to
     *
     * @property relatedId
     * @type String
     * @for Comment
     * @private
     */
    @attr('string') relatedId;

    /**
     * The user who created the comment
     *
     * @property createdby
     * @type UserModel
     * @for Comment
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdby;

    /**
     * The user who last modified the comment
     *
     * @property modifiedBy
     * @type UserModel
     * @for Comment
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The conversation room the comment is associated with
     *
     * @property conversationroom
     * @type ConversationRoomModel
     * @for Comment
     * @private
     */
    @belongsTo('conversationroom', { async: true, inverse: 'comments' }) conversationRoom;
    
    /**
     * The chat room the comment is associated with
     *
     * @property chatRoom
     * @type ChatRoomModel
     * @for Comment
     * @private
     */
    @belongsTo('chatroom', { async: true, inverse: 'comments' }) chatRoom;

    /**
     * The issue the comment is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Comment
     * @private
     */
    @belongsTo('issue', { async: true, inverse: 'comments' }) issue;
    
}