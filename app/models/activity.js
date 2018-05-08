/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Activity
 */
const Validations = buildValidations({
    description: validator('presence', true),
    type: validator('presence', true),
    relatedTo: validator('presence', true),
    relatedId: validator('presence', true)
});

/**
 * The activity model
 *
 * @class Activity
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * The date on which the activity was created
     *
     * @property dateCreated
     * @type String
     * @for Activity
     * @private
     */
    dateCreated: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The description of the activity
     *
     * @property description
     * @type String
     * @for Activity
     * @private
     */
    description: DS.attr('string'),

    /**
     * The identifier of the user who created the activity
     *
     * @property createdUser
     * @type String
     * @for Activity
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The name of the entity the activity is related to
     *
     * @property relatedTo
     * @type String
     * @for Activity
     * @private
     */
    relatedTo: DS.attr('string'),

    /**
     * The identifier of the activity
     *
     * @property relatedId
     * @type String
     * @for Activity
     * @private
     */
    relatedId: DS.attr('string'),

    /**
     * The type of the activity, the type is used to determine the layout of the
     * activity in the time-line
     *
     * @property type
     * @type String
     * @for Activity
     * @private
     */
    type: DS.attr('string'),

    /**
     * Has this record been deleted?
     *
     * @property deleted
     * @type String
     * @for Activity
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * The name of the user who created the activity
     *
     * @property createdUserName
     * @type String
     * @for Activity
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivity
     * @type String
     * @for Activity
     * @private
     */
    relatedActivity: DS.attr('string'),

    /**
     * The identifier of related entity that created the activity
     *
     * @property relatedActivityId
     * @type String
     * @for Activity
     * @private
     */
    relatedActivityId: DS.attr('string'),

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivityModule
     * @type String
     * @for Activity
     * @private
     */
    relatedActivityModule: DS.attr('string'),

    /**
     * The object of the user who created te activity
     *
     * @property createdBy
     * @type UserModel
     * @for Activity
     * @private
     */
    createdBy : DS.belongsTo('user'),

    /**
     * The project the activity is related to
     *
     * @property project
     * @type ProjectModel
     * @for Activity
     * @private
     */
    project : DS.belongsTo('project'),

});