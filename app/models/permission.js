/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The permission model.
 *
 * @class PermissionModel
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class PermissionModel extends Model {
    /**
     * The name of the resource on which permission is applied (e.g. issue.get).
     *
     * @property resourceName
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') resourceName;

    /**
     * The identifier of the role against which permission is created.
     *
     * @property roleId
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') roleId;

    /**
     * Whether the action is allowed ('1') or denied ('0').
     *
     * @property allowed
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') allowed;

    /**
     * Creation date of permission.
     *
     * @property dateCreated
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Modified date of permission.
     *
     * @property dateModified
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') dateModified;
}
