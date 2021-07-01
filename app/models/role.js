/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Role
 */
const Validations = buildValidations({
    name: validator('presence', true)
});

/**
 * The role model
 *
 * @class Role
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * Name of the role
     *
     * @property name
     * @type String
     * @for Role
     * @private
     */
    name: attr('string'),

    /**
     * The date on which the role was created
     *
     * @property dateCreated
     * @type String
     * @for Role
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The date on which the role was last modified
     *
     * @property dateModified
     * @type String
     * @for Role
     * @private
     */
    dateModified: attr('string'),

    /**
     * The soft deletion flag of the role
     *
     * @property deleted
     * @type String
     * @for Role
     * @private
     */
    deleted: attr('string'),

    /**
     * The description of the role
     *
     * @property description
     * @type String
     * @for Role
     * @private
     */
    description: attr('string'),

    /**
     * The identifier of the user who created the role
     *
     * @property createdUser
     * @type String
     * @for Role
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who last modified the role
     *
     * @property modifiedUser
     * @type String
     * @for Role
     * @private
     */
    modifiedUser: attr('string'),

    // Add the relationships here
});