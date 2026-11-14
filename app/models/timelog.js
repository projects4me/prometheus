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
export default class TimelogModel extends Model {

    /**
     * The date on which the time log entry was made
     *
     * @property dateCreated
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the time log entry was last modified
     *
     * @property dateModified
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the time log entry
     *
     * @property deleted
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') deleted;

    /**
     * The identifier of the user who created the time log entry
     *
     * @property createdUser
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the time log entry
     *
     * @property createdUserName
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modifed the time log entry
     *
     * @property modifedUser
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the time log entry
     *
     * @property modifiedUserName
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The identifier of the issue for which the time log entry was made
     *
     * @property issueId
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') issueId;

    /**
     * The minutes part of the time log entry
     *
     * @property minutes
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') minutes;

    /**
     * The hours part of the time log entry
     *
     * @property hours
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') hours;

    /**
     * The days part of the time log entry
     *
     * @property days
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') days;

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
    @attr('string') context;

    /**
     * The description of the task
     *
     * @property description
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') description;

    /**
     * The date the time was spent on
     *
     * @property spentON
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') spentOn;

    /**
     * The project id
     *
     * @property projectId
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') projectId;

    /**
     * The shortcode of the project
     *
     * @property projectShortcode
     * @type String
     * @for Timelog
     * @private
     */
    @attr('string') projectShortcode;

    /**
     * The issue this timelog is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Timelog
     * @private
     */
    @belongsTo('issue', { async: true, inverse: null }) issue;

    /**
     * The project this timelog is associated with
     *
     * @property project
     * @type ProjectModel
     * @for Timelog
     * @private
     */
    @belongsTo('project', { async: true, inverse: null }) project;

    /**
     * The user who created this timelog
     *
     * @property createdBy
     * @type UserModel
     * @for Timelog
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who last modified this timelog
     *
     * @property modifiedBy
     * @type UserModel
     * @for Timelog
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

}