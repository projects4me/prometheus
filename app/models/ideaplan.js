/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The ideaplan model, a versioned implementation plan of an idea
 *
 * @class Ideaplan
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class IdeaplanModel extends Model {

    /**
     * @property ideaId
     * @for Ideaplan
     * @public
     */
    @attr('string') ideaId;

    /**
     * @property version
     * @for Ideaplan
     * @public
     */
    @attr('number') version;

    /**
     * @property body
     * @for Ideaplan
     * @public
     */
    @attr('string') body;

    /**
     * @property status
     * @for Ideaplan
     * @public
     */
    @attr('string') status;

    /**
     * @property error
     * @for Ideaplan
     * @public
     */
    @attr('string') error;

    /**
     * @property dateCreated
     * @for Ideaplan
     * @public
     */
    @attr('string') dateCreated;
}
