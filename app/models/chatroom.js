/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,hasMany } from '@ember-data/model';

/**
 * The chat room model
 *
 * @class Chatroom
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ChatroomModel extends Model {

    /**
     * Subject of the chat room
     *
     * @property subject
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') subject;

    /**
     * The date on which the chatroom was created
     *
     * @property dateCreated
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the chatroom was last modified on
     *
     * @property dateModified
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user who created the chat room
     *
     * @property createdUser
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who last modified the chat room
     *
     * @property modifiedUser
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Name of the user who created the chat room
     *
     * @property createdUserName
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The name of the user who last modified the chat room
     *
     * @property modifiedUserName
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') deleted;

    /**
     * Status of the chat room
     *
     * @property status
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') status;

    /**
     * The type of chat room, group or private
     *
     * @property type
     * @type String
     * @for Chatroom
     * @private
     */
    @attr('string') type;

    /**
     * The conversers in this chat room
     *
     * @property conversers
     * @type UserModel
     * @for Chatroom
     * @private
     */
    @hasMany('user', { async: true, inverse: null }) conversers;

    /**
     * The owner of this chat room
     *
     * @property ownedBy
     * @type UserModel
     * @for Chatroom
     * @private
     */
    @hasMany('user', { async: true, inverse: null }) ownedBy;

    /**
     * Comments made on this conversation room
     *
     * @property comments
     * @type CommentModel
     * @for Chatroom
     * @private
     */
    @hasMany('comment', { async: true, inverse: 'chatRoom' }) comments;

}