/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo,hasMany } from '@ember-data/model';

/**
 * The milestone model
 *
 * @class Milestone
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The name of the milestone
     *
     * @property name
     * @type String
     * @for Milestone
     * @private
     */
    name: attr('string'),

    /**
     * The date on which the milestone was created
     *
     * @property dateCreated
     * @type String
     * @for Milestone
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The date on which the milestone was created
     *
     * @property dateModified
     * @type String
     * @for Milestone
     * @private
     */
    dateModified: attr('string'),

    /**
     * The description of the milestone
     *
     * @property description
     * @type String
     * @for Milestone
     * @private
     */
    description: attr('string'),

    /**
     * The identifier of the user who created the milestone
     *
     * @property createdUser
     * @type String
     * @for Milestone
     * @private
     */
    createdUser: attr('string'),

    /**
     * The identifier of the user who laste modified the milestone
     *
     * @property modifiedUser
     * @type String
     * @for Milestone
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The type of the milestone
     *
     * @property type
     * @type String
     * @for Milestone
     * @private
     */
    milestoneType: attr('string'),

    /**
     * The status of the milestone
     *
     * @property milestone
     * @type String
     * @for Milestone
     * @private
     */
    status: attr('string'),

    /**
     * The start date set for the milestone
     *
     * @property startDate
     * @type String
     * @for Milestone
     * @private
     */
    startDate: attr('string'),

    /**
     * The end date set for the milestone
     *
     * @property endDate
     * @type String
     * @for Milestone
     * @private
     */
    endDate: attr('string'),

    /**
     * The identifier of the project to which this milestone belongs to
     *
     * @property projectId
     * @type String
     * @for Milestone
     * @private
     */
    projectId: attr('string'),

    /**
     * The soft deletion flag of the milestone
     *
     * @property deleted
     * @type String
     * @for Milestone
     * @private
     */
    deleted: attr('string'),

    /**
     * The user who created the milestone
     *
     * @property createdBy
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    createdBy : belongsTo('user'),

    /**
     * The user who last modified the milestone
     *
     * @property modifiedBy
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    modifiedBy : belongsTo('user'),

    /**
     * The project the milestone is related to
     *
     * @property project
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    project : belongsTo('project'),

    /**
     * The issues that belongs to this milestone
     *
     * @property issues
     * @type IssueModel
     * @for Milestone
     * @private
     */
    issues : hasMany('issue', {async : false}),

});