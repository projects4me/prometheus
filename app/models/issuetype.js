/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Issuetype
 */
const Validations = buildValidations({
    name: validator('presence', true)
});

/**
 * The issuetype model
 *
 * @class Issuetype
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * Name of the issue type
     *
     * @property name
     * @type String
     * @for Issuetype
     * @private
     */
    name: attr('string'),

    /**
     * Date on which the issue type was created
     *
     * @property dateCreated
     * @type String
     * @for Issuetype
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the issue type was last modified
     *
     * @property dateModified
     * @type String
     * @for Issuetype
     * @private
     */
    dateModified: attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issuetype
     * @private
     */
    deleted: attr('string'),

    /**
     * Description of the issue type
     *
     * @property description
     * @type String
     * @for Issuetype
     * @private
     */
    description: attr('string'),

    /**
     * Identifier of the create who created the issue type
     *
     * @property createdUser
     * @type String
     * @for Issuetype
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who last modified the issue type
     *
     * @property modifiedUser
     * @type String
     * @for Issuetype
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The identifier of the project the issue type belongs to
     *
     * @property projectId
     * @type String
     * @for Issuetype
     * @private
     */
    projectId: attr('string'),

    /**
     * The system flag, the issue types with system flag cannot be deleted and are
     * inherited by the projects by default
     *
     * @property system
     * @type String
     * @for Issuetype
     * @private
     */
    system: attr('string'),

});