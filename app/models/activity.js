/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo } from '@ember-data/model';

/**
 * The activity model
 *
 * @class Activity
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The date on which the activity was created
     *
     * @property dateCreated
     * @type String
     * @for Activity
     * @private
     */
    dateCreated: attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The description of the activity
     *
     * @property description
     * @type String
     * @for Activity
     * @private
     */
    description: attr('string'),

    /**
     * The identifier of the user who created the activity
     *
     * @property createdUser
     * @type String
     * @for Activity
     * @private
     */
    createdUser: attr('string'),

    /**
     * The name of the entity the activity is related to
     *
     * @property relatedTo
     * @type String
     * @for Activity
     * @private
     */
    relatedTo: attr('string'),

    /**
     * The identifier of the activity
     *
     * @property relatedId
     * @type String
     * @for Activity
     * @private
     */
    relatedId: attr('string'),

    /**
     * The type of the activity, the type is used to determine the layout of the
     * activity in the time-line
     *
     * @property type
     * @type String
     * @for Activity
     * @private
     */
    type: attr('string'),

    /**
     * Has this record been deleted?
     *
     * @property deleted
     * @type String
     * @for Activity
     * @private
     */
    deleted: attr('string'),

    /**
     * The name of the user who created the activity
     *
     * @property createdUserName
     * @type String
     * @for Activity
     * @private
     */
    createdUserName: attr('string'),

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivity
     * @type String
     * @for Activity
     * @private
     */
    relatedActivity: attr('string'),

    /**
     * The identifier of related entity that created the activity
     *
     * @property relatedActivityId
     * @type String
     * @for Activity
     * @private
     */
    relatedActivityId: attr('string'),

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivityModule
     * @type String
     * @for Activity
     * @private
     */
    relatedActivityModule: attr('string'),

    /**
     * The object of the user who created te activity
     *
     * @property createdBy
     * @type UserModel
     * @for Activity
     * @private
     */
    createdBy : belongsTo('user'),

    /**
     * The project the activity is related to
     *
     * @property project
     * @type ProjectModel
     * @for Activity
     * @private
     */
    project : belongsTo('project'),

});