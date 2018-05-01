/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
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
export default DS.Model.extend(Validations, {

    /**
     * Name of the issue type
     *
     * @property name
     * @type String
     * @for Issuetype
     * @private
     */
    name: DS.attr('string'),

    /**
     * Date on which the issue type was created
     *
     * @property dateCreated
     * @type String
     * @for Issuetype
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the issue type was last modified
     *
     * @property dateModified
     * @type String
     * @for Issuetype
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issuetype
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Description of the issue type
     *
     * @property description
     * @type String
     * @for Issuetype
     * @private
     */
    description: DS.attr('string'),

    /**
     * Identifier of the create who created the issue type
     *
     * @property createdUser
     * @type String
     * @for Issuetype
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The identifier of the user who last modified the issue type
     *
     * @property modifiedUser
     * @type String
     * @for Issuetype
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The identifier of the project the issue type belongs to
     *
     * @property projectId
     * @type String
     * @for Issuetype
     * @private
     */
    projectId: DS.attr('string'),

    /**
     * The system flag, the issue types with system flag cannot be deleted and are
     * inherited by the projects by default
     *
     * @property system
     * @type String
     * @for Issuetype
     * @private
     */
    system: DS.attr('string'),

});