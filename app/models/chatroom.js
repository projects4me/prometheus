/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Chatroom
 */
const Validations = buildValidations({
    subject: validator('presence', true),
    type: validator('presence', true),
    status: validator('presence', true)
});

/**
 * The chat room model
 *
 * @class Chatroom
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * Subject of the chat room
     *
     * @property subject
     * @type String
     * @for Chatroom
     * @private
     */
    subject: DS.attr('string'),

    /**
     * The date on which the chatroom was created
     *
     * @property dateCreated
     * @type String
     * @for Chatroom
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * The date on which the chatroom was last modified on
     *
     * @property dateModified
     * @type String
     * @for Chatroom
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user who created the chat room
     *
     * @property createdUser
     * @type String
     * @for Chatroom
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The identifier of the user who last modified the chat room
     *
     * @property modifiedUser
     * @type String
     * @for Chatroom
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * Name of the user who created the chat room
     *
     * @property createdUserName
     * @type String
     * @for Chatroom
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The name of the user who last modified the chat room
     *
     * @property modifiedUserName
     * @type String
     * @for Chatroom
     * @private
     */
    modifiedUserName: DS.attr('string'),

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Chatroom
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Status of the chat room
     *
     * @property status
     * @type String
     * @for Chatroom
     * @private
     */
    status: DS.attr('string'),

    /**
     * The type of chat room, group or private
     *
     * @property type
     * @type String
     * @for Chatroom
     * @private
     */
    type: DS.attr('string'),

    /**
     * The conversers in this chat room
     *
     * @property conversers
     * @type Relationship
     * @for Chatroom
     * @private
     */
    conversers: DS.hasMany('user'),

    /**
     * The owner of this chat room
     *
     * @property ownedBy
     * @type Relationship
     * @for Chatroom
     * @private
     */
    ownedBy: DS.hasMany('user'),

    /**
     * Comments made on this conversation room
     *
     * @property comments
     * @type Relationship
     * @for Chatroom
     * @private
     */
    comments: DS.hasMany('comment'),

});