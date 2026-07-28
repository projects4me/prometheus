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
     * Full resource name on which permission is applied (e.g. issue.get).
     *
     * @property entity
     * @type String
     * @for Userpermission
     * @private
     */
    @attr('string') entity;

    /**
     * Whether the action is allowed ('1') or denied ('0').
     *
     * @property allowed
     * @type String
     * @for Userpermission
     * @private
     */
    @attr('string') allowed;
}
