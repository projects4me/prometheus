/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The Badge model
 *
 * @class BadgeModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class BadgeModel extends Model {

    /**
     * The name of the badge.
     * 
     * @property name
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') name;

    /**
     * The date on which the badge was created.
     *
     * @property dateCreated
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the badge was last modified.
     *
     * @property dateModified
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the badge.
     *
     * @property deleted
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') deleted;

    /**
     * The identifier of the user who created the badge.
     *
     * @property createdUser
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the badge.
     *
     * @property createdUserName
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the badge.
     *
     * @property modifiedUser
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the badge.
     *
     * @property modifiedUserName
     * @type String
     * @for Badge
     * @private
     */
    @attr('string') modifiedUserName;

}
