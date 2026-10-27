/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * The ideaplanissue model, links an issue created from a plan to its idea
 *
 * @class Ideaplanissue
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class IdeaplanissueModel extends Model {

    /**
     * @property ideaId
     * @for Ideaplanissue
     * @public
     */
    @attr('string') ideaId;

    /**
     * @property ideaplanId
     * @for Ideaplanissue
     * @public
     */
    @attr('string') ideaplanId;

    /**
     * @property key
     * @for Ideaplanissue
     * @public
     */
    @attr('string') key;

    /**
     * @property issueId
     * @for Ideaplanissue
     * @public
     */
    @attr('string') issueId;

    /**
     * @property issue
     * @for Ideaplanissue
     * @public
     */
    @belongsTo('issue', { async: true, inverse: null }) issue;


    /**
     * The created issue when it is already in the store, null otherwise. Unlike `issue` (an async relation that
     * fetches on access) reading it never triggers a request.
     *
     * @property loadedIssue
     * @for Ideaplanissue
     * @public
     */
    get loadedIssue() {
        return this.belongsTo('issue').value() ?? null;
    }
}
