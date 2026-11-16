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
export default class MilestoneModel extends Model {

    /**
     * The name of the milestone
     *
     * @property name
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') name;

    /**
     * The date on which the milestone was created
     *
     * @property dateCreated
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the milestone was created
     *
     * @property dateModified
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') dateModified;

    /**
     * The description of the milestone
     *
     * @property description
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') description;

    /**
     * The identifier of the user who created the milestone
     *
     * @property createdUser
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who laste modified the milestone
     *
     * @property modifiedUser
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The type of the milestone
     *
     * @property type
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') milestoneType;

    /**
     * The status of the milestone
     *
     * @property milestone
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') status;

    /**
     * The start date set for the milestone
     *
     * @property startDate
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') startDate;

    /**
     * The end date set for the milestone
     *
     * @property endDate
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') endDate;

    /**
     * The identifier of the project to which this milestone belongs to
     *
     * @property projectId
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') projectId;

    /**
     * The soft deletion flag of the milestone
     *
     * @property deleted
     * @type String
     * @for Milestone
     * @private
     */
    @attr('string') deleted;

    /**
     * The user who created the milestone
     *
     * @property createdBy
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who last modified the milestone
     *
     * @property modifiedBy
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The project the milestone is related to
     *
     * @property project
     * @type ProjectModel
     * @for Milestone
     * @private
     */
    @belongsTo('project', { async: true, inverse: 'milestones' }) project;

    /**
     * The issues that belongs to this milestone
     *
     * @property issues
     * @type IssueModel
     * @for Milestone
     * @private
     */
    @hasMany('issue', { async: false, inverse: 'issuemilestone' }) issues;

}