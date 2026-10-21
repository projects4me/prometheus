/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The idea model, a project scoped idea that is brainstormed before it becomes issues
 *
 * @class Idea
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class IdeaModel extends Model {

    /**
     * @property projectId
     * @for Idea
     * @public
     */
    @attr('string') projectId;

    /**
     * @property title
     * @for Idea
     * @public
     */
    @attr('string') title;

    /**
     * @property description
     * @for Idea
     * @public
     */
    @attr('string') description;

    /**
     * @property status
     * @for Idea
     * @public
     */
    @attr('string') status;

    /**
     * @property createdUser
     * @for Idea
     * @public
     */
    @attr('string') createdUser;

    /**
     * @property dateCreated
     * @for Idea
     * @public
     */
    @attr('string') dateCreated;

    /**
     * @property dateModified
     * @for Idea
     * @public
     */
    @attr('string') dateModified;
}
