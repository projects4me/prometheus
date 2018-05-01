/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Tagged
 */
const Validations = buildValidations({
    relatedTo: validator('presence', true),
    relatedId: validator('presence', true),
    tagId: validator('presence', true)
});

/**
 * The tagged model. This model is used to maint the relationship between tags
 * and the related entities.
 *
 * @class Tagged
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * The identifier of the entity the tag is related to
     *
     * @property relatedId
     * @type String
     * @for Tagged
     * @private
     */
    "relatedId": DS.attr('string'),

    /**
     * The entity the tag is related to
     *
     * @property relatedTo
     * @type String
     * @for Tagged
     * @private
     */
    "relatedTo": DS.attr('string'),

    /**
     * The identifier of the tag
     *
     * @property tagId
     * @type String
     * @for Tagged
     * @private
     */
    "tagId": DS.attr('string')

});