/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * One ranked match of Gaia's cross-module search (`GET /api/v1/search`). The id is `<module>:<recordId>`; the
 * record itself is read from its own module.
 *
 * @class SearchresultModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class SearchresultModel extends Model {

    /**
     * The search type of the record, e.g. issue
     *
     * @property module
     * @type String
     */
    @attr('string') module;

    /**
     * The id of the matched record
     *
     * @property recordId
     * @type String
     */
    @attr('string') recordId;

    /**
     * The record's title, null when the user may not read the field
     *
     * @property title
     * @type String
     */
    @attr('string') title;

    /**
     * A short extract of the record, null when the user may not read the field
     *
     * @property snippet
     * @type String
     */
    @attr('string') snippet;

    /**
     * Orders the results of one response only
     *
     * @property score
     * @type Number
     */
    @attr('number') score;

    /**
     * The searchers that found the record: exact, fts, fuzzy, semantic
     *
     * @property matchedBy
     * @type Array
     */
    @attr() matchedBy;

    /**
     * True when the exact searcher found the record, e.g. by its issue number
     *
     * @property pinned
     * @type Boolean
     */
    @attr('boolean') pinned;
}
