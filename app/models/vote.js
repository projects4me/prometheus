/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Vote
 */
const Validations = buildValidations({
    relatedId: validator('presence', true),
    relatedTo: validator('presence', true),
    vote: validator('presence', true)
});

/**
 * The vote model
 *
 * @class Vote
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * Date on which the vote was created
     *
     * @property dateCreated
     * @type String
     * @for Vote
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the vote was last modified
     *
     * @property dateModified
     * @type String
     * @for Vote
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user who created the vote
     *
     * @property createdUser
     * @type String
     * @for Vote
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The name of the use who created the vote
     *
     * @property createdUserName
     * @type String
     * @for Vote
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The identifier of the user who last modified the vote
     *
     * @property modifiedUser
     * @type String
     * @for Vote
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The name of the user who last modified the vote
     *
     * @property modifiedUserName
     * @type String
     * @for Vote
     * @private
     */
    modifiedUserName: DS.attr('string'),

    /**
     * The vote flag
     *
     * @property deleted
     * @type String
     * @for Vote
     * @private
     */
    vote: DS.attr('string'),

    /**
     * The identifier of the record this vote is related to
     *
     * @property relatedId
     * @type String
     * @for Vote
     * @private
     */
    relatedId: DS.attr('string'),

    /**
     * The model this vote is related to
     *
     * @property relatedTo
     * @type String
     * @for Vote
     * @private
     */
    relatedTo: DS.attr('string'),

});