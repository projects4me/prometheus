/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The role model
 *
 * @class Role
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class RoleModel extends Model {

    /**
     * Name of the role
     *
     * @property name
     * @type String
     * @for Role
     * @private
     */
    @attr('string') name;

    /**
     * The date on which the role was created
     *
     * @property dateCreated
     * @type String
     * @for Role
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the role was last modified
     *
     * @property dateModified
     * @type String
     * @for Role
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the role
     *
     * @property deleted
     * @type String
     * @for Role
     * @private
     */
    @attr('string') deleted;

    /**
     * The description of the role
     *
     * @property description
     * @type String
     * @for Role
     * @private
     */
    @attr('string') description;

    /**
     * The identifier of the user who created the role
     *
     * @property createdUser
     * @type String
     * @for Role
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the role
     *
     * @property createdUserName
     * @type String
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the role
     *
     * @property modifiedUser
     * @type String
     * @for Role
     * @private
     */
    @attr('string') modifiedUser;

}