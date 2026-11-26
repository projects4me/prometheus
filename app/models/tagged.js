/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The tagged model. This model is used to maint the relationship between tags
 * and the related entities.
 *
 * @class Tagged
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class TaggedModel extends Model {

    /**
     * The identifier of the entity the tag is related to
     *
     * @property relatedId
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') relatedId;

    /**
     * The entity the tag is related to
     *
     * @property relatedTo
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') relatedTo;

    /**
     * The identifier of the tag
     *
     * @property tagId
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') tagId;

    /**
     * The project of the tag the record is tagged with
     *
     * @property projectId
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') projectId;

    /**
     * The tag this tagged is associated with
     *
     * @property tag
     * @type TagModel
     * @for Tagged
     * @private
     */
    @belongsTo('tag', { async: true, inverse: null }) tag;
    
    /**
     * The project this tagged is associated with
     *
     * @property project
     * @type ProjectModel
     * @for Tagged
     * @Tagged
     */
    @hasMany('project', { async: true, inverse: null }) project;

    /**
     * The issue this tagged is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Tagged
     * @private
     */
    @hasMany('issue', { async: true, inverse: null }) issue;

    /**
     * The wiki this tagged is associated with
     *
     * @property wiki
     * @type WikiModel
     * @for Tagged
     * @private
     */
    @hasMany('wiki', { async: true, inverse: 'tagged' }) wiki;
    
}