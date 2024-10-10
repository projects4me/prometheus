/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The User Permission model
 *
 * @class UserpermissionModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserpermissionModel extends Model {

    /**
     * Identifier of user.
     * 
     * @property userId
     * @type String
     * @for Userpermission
     * @private
     */
    @attr('string') userId;

    /**
     * Entity/Resource name on which permission is applied.
     * 
     * @property entity
     * @type String
     * @for Userpermission
     * @private
     */
    @attr('string') entity;

    /**
     * Read action value.
     * 
     * @property _read
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _read;

    /**
     * Create action value.
     * 
     * @property _create
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _create;

    /**
     * Update action value.
     * 
     * @property _update
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _update;

    /**
     * Delete action value
     * 
     * @property _delete
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _delete;

    /**
     * Import action value.
     * 
     * @property _import
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _import;

    /**
     * Export action value.
     * 
     * @property _export
     * @type String
     * @for Userpermission
     * @private
     */    
    @attr('string') _export;
}
