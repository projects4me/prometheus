/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The Converser model
 *
 * @class Converser
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The identifier of the user who is involved in this chat
     *
     * @property userId
     * @type String
     * @for Converser
     * @private
     */
    userId: attr('string'),

    /**
     * The identifier of the chatroom to whom this user belongs
     * to
     *
     * @property chatRoomId
     * @type String
     * @for Converser
     * @private
     */
    chatRoomId: attr('string'),

    /**
     * The chatroom the converser is associated with
     *
     * @property chatroom
     * @type ChatRoomModel
     * @for Converser
     * @private
     */
    chatroom: belongsTo('chatroom'),

    /**
     * The users who are conversing
     *
     * @property users
     * @type UserModel
     * @for Converser
     * @private
     */
    users: hasMany('user')
    
});