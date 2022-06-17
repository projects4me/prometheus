/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The Badge level model
 *
 * @class BadgelevelModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class BadgelevelModel extends Model {

    /**
     * The type of the badge.
     * 
     * @property name
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') name;

    /**
     * The identifier of the badge.
     * 
     * @property name
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') badgeId;

    /**
     * The maximum score for the acheviement of badge.
     * 
     * @property maxCriteria
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('number') maxCriteria;

    /**
     * The minimum score for the acheviement of badge.
     * 
     * @property minCriteria
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('number') minCriteria;

    /**
     * The date on which the badge level was created.
     *
     * @property dateCreated
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the badge level was last modified.
     *
     * @property dateModified
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the badge level.
     *
     * @property deleted
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') deleted;

    /**
     * The identifier of the user who created the badge level.
     *
     * @property createdUser
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the badge level.
     *
     * @property createdUserName
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the badge level.
     *
     * @property modifiedUser
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the badge level.
     *
     * @property modifiedUserName
     * @type String
     * @for Badgelevel
     * @private
     */
    @attr('string') modifiedUserName;

}