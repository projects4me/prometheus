/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Dashboard
 */
const Validations = buildValidations({
    userId: validator('presence', true),
    name: validator('presence', true)
});

/**
 * The dashboard model
 *
 * @class Dashboard
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    userId: DS.attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    name: DS.attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    widgets: DS.attr('string'),
});