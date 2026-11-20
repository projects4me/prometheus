/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The doc model, a project scoped document of the Docs module
 *
 * @class Doc
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class DocModel extends Model {

    /**
     * @property title
     * @for Doc
     * @public
     */
    @attr('string') title;

    /**
     * @property body
     * @for Doc
     * @public
     */
    @attr('string') body;

    /**
     * @property projectId
     * @for Doc
     * @public
     */
    @attr('string') projectId;

    /**
     * @property ownerId
     * @for Doc
     * @public
     */
    @attr('string') ownerId;

    /**
     * Whether the doc is locked against editing
     *
     * @property locked
     * @type Boolean
     * @for Doc
     * @public
     */
    @attr('boolean') locked;

    /**
     * @property dateCreated
     * @for Doc
     * @public
     */
    @attr('string') dateCreated;

    /**
     * @property dateModified
     * @for Doc
     * @public
     */
    @attr('string') dateModified;

    /**
     * @property createdUser
     * @for Doc
     * @public
     */
    @attr('string') createdUser;

    /**
     * @property modifiedUser
     * @for Doc
     * @public
     */
    @attr('string') modifiedUser;

    /**
     * The project the doc belongs to
     *
     * @property project
     * @type Prometheus.Models.Project
     * @for Doc
     * @public
     */
    @belongsTo('project', { async: true, inverse: null }) project;

    /**
     * The user who owns the doc
     *
     * @property owner
     * @type Prometheus.Models.User
     * @for Doc
     * @public
     */
    @belongsTo('user', { async: true, inverse: null }) owner;

    /**
     * The tags of the doc
     *
     * @property tag
     * @type Prometheus.Models.Tag
     * @for Doc
     * @public
     */
    @hasMany('tag', { async: true, inverse: null }) tag;
}
