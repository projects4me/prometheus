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
     * The identifier of the resource on which permission is applied.
     * 
     * @property resourceId
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') resourceId;

    /**
     * The name of the resource on which permission is applied.
     * 
     * @property resourceName
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') resourceName;

    /**
     * The identifier of the roleId against which permission is created.
     * 
     * @property roleId
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') roleId;

    /**
     * The value of the read flag.
     * 
     * @property readF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') readF;

    /**
     * The value of the create flag.
     * 
     * @property createF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') createF;

    /**
     * The value of the update flag.
     * 
     * @property updateF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') updateF;

    /**
     * The value of the delete flag.
     * 
     * @property deleteF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') deleteF;

    /**
     * The value of the import flag.
     * 
     * @property importF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') importF;

    /**
     * The value of the export flag.
     * 
     * @property exportF
     * @type String
     * @for PermissionModel
     * @private
     */
    @attr('string') exportF;

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
