/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Savedsearch
 */
const Validations = buildValidations({
    name: validator('presence', true),
    searchquery: validator('presence', true)
});

/**
 * The saved searches model
 *
 * @class Savedsearch
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * Name of the saved search
     *
     * @property name
     * @type String
     * @for Savedsearch
     * @private
     */
    name: DS.attr('string'),

    /**
     * The date on which the saved search was created
     *
     * @property dateCreated
     * @type String
     * @for Savedsearch
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * The identifier of the user who saved the search
     *
     * @property createUser
     * @type String
     * @for Savedsearch
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * Name of the user who saved this search
     *
     * @property createdUserName
     * @type String
     * @for Savedsearch
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The flag that indicates whether this search is available publicly
     *
     * @property public
     * @type String
     * @for Savedsearch
     * @private
     */
    public: DS.attr('bool'),

    /**
     * The query string for the search
     *
     * @property query
     * @type String
     * @for Savedsearch
     * @private
     */
    searchquery: DS.attr('string'),

    /**
     * The module for which this saved search was created
     *
     * @property relatedTo
     * @type String
     * @for Savedsearch
     * @private
     */
    relatedTo: DS.attr('string'),

    /**
     * The project for which this search was created
     *
     * @property projectId
     * @type String
     * @for Savedsearch
     * @private
     */
    projectId: DS.attr('string')

});