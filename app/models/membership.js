/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Membership
 */
const Validations = buildValidations({
    projectId: validator('presence', true),
    userId: validator('presence', true),
    roleId: validator('presence', true)
});

/**
 * The membership model
 *
 * @class Membership
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * The identifier of the project for which this membership rule is defined
     *
     * @property projectId
     * @type String
     * @for Membership
     * @private
     */
    projectId: DS.attr('string'),

    /**
     * The identifier of the for whom this membership rule is defined
     *
     * @property userId
     * @type String
     * @for Membership
     * @private
     */
    userId: DS.attr('string'),

    /**
     * The identifier of the role which is assigned to the user under the projectId
     * that this rule is defined for
     *
     * @property roleId
     * @type String
     * @for Membership
     * @private
     */
    roleId: DS.attr('string'),

    /**
     * The soft deletion flag for the membership
     *
     * @property deleted
     * @type String
     * @for Membership
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * The date on which this membership rule was created
     *
     * @property dateCreated
     * @type String
     * @for Membership
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * The date on which this membership rule was last modified
     *
     * @property dateModified
     * @type String
     * @for Membership
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user who created the membership rule
     *
     * @property createdUser
     * @type String
     * @for Membership
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The identifier of the user who last modified the membership rule
     *
     * @property modifiedUser
     * @type String
     * @for Membership
     *@private
     */
    modifiedUser: DS.attr('string'),

    // Add the relationships here
});