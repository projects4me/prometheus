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
export default Model.extend({

    /**
     * The date on which the comment was created
     *
     * @property dateCreated
     * @type String
     * @for Comment
     * @private
     */
    dateCreated: attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The date on which the comment was last modified
     *
     * @property dateModified
     * @type String
     * @for Comment
     * @private
     */
    dateModified: attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The soft deletion flag of the comment
     *
     * @property deleted
     * @type String
     * @for Comment
     * @private
     */
    deleted: attr('string'),

    /**
     * The comment
     *
     * @property comment
     * @type String
     * @for CommentModel
     * @private
     */
    comment: attr('string'),

    /**
     * The identifier of the user who created the comment
     *
     * @property createdUser
     * @type String
     * @for Comment
     * @private
     */
    createdUser: attr('string'),

    /**
     * The name of the user who created the comment
     *
     * @property createdUserName
     * @type String
     * @for Comment
     * @private
     */
    createdUserName: attr('string'),

    /**
     * The identifier of the user who last modified the comment
     *
     * @property modifiedUser
     * @type String
     * @for Comment
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The name of the user who last modified the comment
     *
     * @property modifiedUserName
     * @type String
     * @for Comment
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The entity the comment is related to
     *
     * @property relatedTo
     * @type String
     * @for Comment
     * @private
     */
    relatedTo: attr('string'),

    /**
     * The identifier of the record the comment is related to
     *
     * @property relatedId
     * @type String
     * @for Comment
     * @private
     */
    relatedId: attr('string'),

    /**
     * The user who created the comment
     *
     * @property createdby
     * @type UserModel
     * @for Comment
     * @private
     */
    createdby: belongsTo('user'),

    /**
     * The user who last modified the comment
     *
     * @property modifiedBy
     * @type UserModel
     * @for Comment
     * @private
     */
    modifiedBy: belongsTo('user'),

    /**
     * The conversation room the comment is associated with
     *
     * @property conversationroom
     * @type ConversationRoomModel
     * @for Comment
     * @private
     */
    conversationroom: belongsTo('conversationroom'),
    
    /**
     * The chat room the comment is associated with
     *
     * @property chatRoom
     * @type ChatRoomModel
     * @for Comment
     * @private
     */
    chatRoom: belongsTo('chatroom'),

    /**
     * The issue the comment is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Comment
     * @private
     */
    issue: belongsTo('issue')
    
});