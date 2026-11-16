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
export default class ActivityModel extends Model {

    /**
     * The date on which the activity was created
     *
     * @property dateCreated
     * @type String
     * @for Activity
     * @private
     */
    @attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}) dateCreated;

    /**
     * The description of the activity
     *
     * @property description
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') description;

    /**
     * The identifier of the user who created the activity
     *
     * @property createdUser
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the entity the activity is related to
     *
     * @property relatedTo
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') relatedTo;

    /**
     * The identifier of the activity
     *
     * @property relatedId
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') relatedId;

    /**
     * The type of the activity, the type is used to determine the layout of the
     * activity in the time-line
     *
     * @property type
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') type;

    /**
     * Has this record been deleted?
     *
     * @property deleted
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') deleted;

    /**
     * The name of the user who created the activity
     *
     * @property createdUserName
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') createdUserName;

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivity
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') relatedActivity;

    /**
     * The identifier of related entity that created the activity
     *
     * @property relatedActivityId
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') relatedActivityId;

    /**
     * If the type of activity is related when this field tells us the type of
     * activity that was performed for the related item
     *
     * @property relatedActivityModule
     * @type String
     * @for Activity
     * @private
     */
    @attr('string') relatedActivityModule;

    /**
     * The context of the activity
     *
     * @property context
     * @type Json
     * @for Activity
     * @private
     */
    @attr('json') context;

    /**
     * The object of the user who created te activity
     *
     * @property createdBy
     * @type UserModel
     * @for Activity
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The project the activity is related to
     *
     * @property project
     * @type ProjectModel
     * @for Activity
     * @private
     */
    @belongsTo('project', { async: true, inverse: 'activities' }) project;

    /**
     * The issue the activity is related to
     *
     * @property issue
     * @type IssueModel
     * @for Activity
     * @private
     */
    @belongsTo('issue', { async: true, inverse: 'activities' }) issue;
}