/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The membership model
 *
 * @class Membership
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The identifier of the project for which this membership rule is defined
     *
     * @property projectId
     * @type String
     * @for Membership
     * @private
     */
    projectId: attr('string'),

    /**
     * The identifier of the for whom this membership rule is defined
     *
     * @property userId
     * @type String
     * @for Membership
     * @private
     */
    userId: attr('string'),

    /**
     * The identifier of the role which is assigned to the user under the projectId
     * that this rule is defined for
     *
     * @property roleId
     * @type String
     * @for Membership
     * @private
     */
    roleId: attr('string'),

    /**
     * The soft deletion flag for the membership
     *
     * @property deleted
     * @type String
     * @for Membership
     * @private
     */
    deleted: attr('string'),

    /**
     * The date on which this membership rule was created
     *
     * @property dateCreated
     * @type String
     * @for Membership
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The date on which this membership rule was last modified
     *
     * @property dateModified
     * @type String
     * @for Membership
     * @private
     */
    dateModified: attr('string'),

    /**
     * The identifier of the user who created the membership rule
     *
     * @property createdUser
     * @type String
     * @for Membership
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who last modified the membership rule
     *
     * @property modifiedUser
     * @type String
     * @for Membership
     *@private
     */
    modifiedUser: attr('string'),

});