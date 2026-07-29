/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * Application-wide role assignment linking a user to a role.
 *
 * @class Userrole
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default Model.extend({

    /**
     * The identifier of the user this role assignment belongs to.
     *
     * @property userId
     * @type String
     * @for Userrole
     * @private
     */
    userId: attr('string'),

    /**
     * The identifier of the role assigned to the user.
     *
     * @property roleId
     * @type String
     * @for Userrole
     * @private
     */
    roleId: attr('string'),

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userrole
     * @private
     */
    deleted: attr('string'),

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userrole
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userrole
     * @private
     */
    dateModified: attr('string'),

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userrole
     * @private
     */
    createdUser: attr('string'),

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userrole
     * @private
     */
    createdUserName: attr('string'),

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userrole
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userrole
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The user this role assignment belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userrole
     * @private
     */
    user: belongsTo('user'),

    /**
     * The role assigned to the user.
     *
     * @property role
     * @type {Prometheus.Models.Role}
     * @for Userrole
     * @private
     */
    role: belongsTo('role'),

});
