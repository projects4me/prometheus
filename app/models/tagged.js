/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, hasMany } from '@ember-data/model';

/**
 * The tagged model. This model is used to maint the relationship between tags
 * and the related entities.
 *
 * @class Tagged
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The identifier of the entity the tag is related to
     *
     * @property relatedId
     * @type String
     * @for Tagged
     * @private
     */
    "relatedId": attr('string'),

    /**
     * The entity the tag is related to
     *
     * @property relatedTo
     * @type String
     * @for Tagged
     * @private
     */
    "relatedTo": attr('string'),

    /**
     * The identifier of the tag
     *
     * @property tagId
     * @type String
     * @for Tagged
     * @private
     */
    "tagId": attr('string'),

    /**
     * The tag this tagged is associated with
     *
     * @property tag
     * @type TagModel
     * @for Tagged
     * @private
     */
    tag: hasMany('tag'),
    
    /**
     * The project this tagged is associated with
     *
     * @property project
     * @type ProjectModel
     * @for Tagged
     * @Tagged
     */
    project: hasMany('project'),

    /**
     * The issue this tagged is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Tagged
     * @private
     */
    issue: hasMany('issue'),

    /**
     * The wiki this tagged is associated with
     *
     * @property wiki
     * @type WikiModel
     * @for Tagged
     * @private
     */
    wiki: hasMany('wiki')
    
});