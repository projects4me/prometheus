/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';
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
export default Model.extend(Validations, {

    /**
     * Name of the saved search
     *
     * @property name
     * @type String
     * @for Savedsearch
     * @private
     */
    name: attr('string'),

    /**
     * The date on which the saved search was created
     *
     * @property dateCreated
     * @type String
     * @for Savedsearch
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The identifier of the user who saved the search
     *
     * @property createUser
     * @type String
     * @for Savedsearch
     * @private
     */
    createdUser: attr('string'),

    /**
     * Name of the user who saved this search
     *
     * @property createdUserName
     * @type String
     * @for Savedsearch
     * @private
     */
    createdUserName: attr('string'),

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Savedsearch
     * @private
     */
    deleted: attr('string'),

    /**
     * The flag that indicates whether this search is available publicly
     *
     * @property public
     * @type String
     * @for Savedsearch
     * @private
     */
    public: attr('bool'),

    /**
     * The query string for the search
     *
     * @property query
     * @type String
     * @for Savedsearch
     * @private
     */
    searchquery: attr('string'),

    /**
     * The module for which this saved search was created
     *
     * @property relatedTo
     * @type String
     * @for Savedsearch
     * @private
     */
    relatedTo: attr('string'),

    /**
     * The project for which this search was created
     *
     * @property projectId
     * @type String
     * @for Savedsearch
     * @private
     */
    projectId: attr('string')

});