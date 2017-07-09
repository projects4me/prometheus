/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The user model
 *
 * @class User
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * Username
     *
     * @property username
     * @type String
     * @for User
     * @private
     */
    username: DS.attr('string'),

    /**
     * Email Address
     *
     * @property email
     * @type String
     * @for User
     * @private
     */
    email: DS.attr('string'),

    /**
     * Status
     *
     * @property status
     * @type String
     * @for User
     * @private
     */
    status: DS.attr('string'),

    /**
     * Name
     *
     * @property name
     * @type String
     * @for User
     * @private
     */
    name: DS.attr('string'),

    /**
     * Date on which the user was created
     *
     * @property dateCreated
     * @type String
     * @for User
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the user was last modified
     *
     * @property dateModified
     * @type String
     * @for User
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for User
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Description
     *
     * @property description
     * @type String
     * @for User
     * @private
     */
    description: DS.attr('string'),

    /**
     * User who created this user
     *
     * @property createdUser
     * @type String
     * @for User
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * User who modified this user
     *
     * @property modifiedUser
     * @type String
     * @for User
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * Title of the user
     *
     * @property title
     * @type String
     * @for User
     * @private
     */
    title: DS.attr('string'),

    /**
     * Phone number of the user
     *
     * @property phone
     * @type String
     * @for User
     * @private
     */
    phone: DS.attr('string')

});