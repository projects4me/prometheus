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
export default class UserroleModel extends Model {

    /**
     * The identifier of the user this role assignment belongs to.
     *
     * @property userId
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') userId;

    /**
     * The identifier of the role assigned to the user.
     *
     * @property roleId
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') roleId;

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') deleted;

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') dateModified;

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') createdUser;

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') createdUserName;

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userrole
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The user this role assignment belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userrole
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) user;

    /**
     * The role assigned to the user.
     *
     * @property role
     * @type {Prometheus.Models.Role}
     * @for Userrole
     * @private
     */
    @belongsTo('role', { async: true, inverse: null }) role;

}
