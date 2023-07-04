/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo } from '@ember-data/model';

/**
 * The time log model
 *
 * @class Timelog
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The date on which the time log entry was made
     *
     * @property dateCreated
     * @type String
     * @for Timelog
     * @private
     */
    "dateCreated": attr('string'),

    /**
     * The date on which the time log entry was last modified
     *
     * @property dateModified
     * @type String
     * @for Timelog
     * @private
     */
    "dateModified": attr('string'),

    /**
     * The soft deletion flag of the time log entry
     *
     * @property deleted
     * @type String
     * @for Timelog
     * @private
     */
    "deleted": attr('string'),

    /**
     * The identifier of the user who created the time log entry
     *
     * @property createdUser
     * @type String
     * @for Timelog
     * @private
     */
    "createdUser": attr('string'),

    /**
     * The name of the user who created the time log entry
     *
     * @property createdUserName
     * @type String
     * @for Timelog
     * @private
     */
    "createdUserName": attr('string'),

    /**
     * The identifier of the user who last modifed the time log entry
     *
     * @property modifedUser
     * @type String
     * @for Timelog
     * @private
     */
    "modifiedUser": attr('string'),

    /**
     * The name of the user who last modified the time log entry
     *
     * @property modifiedUserName
     * @type String
     * @for Timelog
     * @private
     */
    "modifiedUserName": attr('string'),

    /**
     * The identifier of the issue for which the time log entry was made
     *
     * @property issueId
     * @type String
     * @for Timelog
     * @private
     */
    "issueId": attr('string'),

    /**
     * The minutes part of the time log entry
     *
     * @property minutes
     * @type String
     * @for Timelog
     * @private
     */
    "minutes": attr('string'),

    /**
     * The hours part of the time log entry
     *
     * @property hours
     * @type String
     * @for Timelog
     * @private
     */
    "hours": attr('string'),

    /**
     * The days part of the time log entry
     *
     * @property days
     * @type String
     * @for Timelog
     * @private
     */
    "days": attr('string'),

    /**
     * The context in which the time log entry was made, currently we are supporting
     * estiamted time and the spent time. The estimated time is represented by 'est'
     * and the spent time is represented by 'spent'
     *
     * @property context
     * @type String
     * @for Timelog
     * @private
     */
    "context": attr('string'),

    /**
     * The description of the task
     *
     * @property description
     * @type String
     * @for Timelog
     * @private
     */
    "description": attr('string'),

    /**
     * The date the time was spent on
     *
     * @property spentON
     * @type String
     * @for Timelog
     * @private
     */
    "spentOn": attr('string'),

    /**
     * The issue this timelog is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Timelog
     * @private
     */
    issue: belongsTo('issue'),

    /**
     * The user who created this timelog
     *
     * @property createdBy
     * @type UserModel
     * @for Timelog
     * @private
     */
    createdBy: belongsTo('user'),

    /**
     * The user who last modified this timelog
     *
     * @property modifiedBy
     * @type UserModel
     * @for Timelog
     * @private
     */
    modifiedBy: belongsTo('user')

});