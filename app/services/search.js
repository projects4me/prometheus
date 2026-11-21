/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import snippetParts from 'prometheus/utils/search/snippet-parts';

/**
 * Finds issues through Gaia's ranked search (`GET /api/v1/search`), which combines exact, full-text, fuzzy and
 * semantic matching. The search answers ids, titles and snippets only, so the matched issues are read in one more
 * query and returned in the search's order.
 *
 * @class SearchService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class SearchService extends Service {

    /**
     * The shortest query Gaia accepts
     *
     * @property MIN_QUERY_LENGTH
     * @type Number
     * @static
     */
    static MIN_QUERY_LENGTH = 2;

    /**
     * @property store
     * @type Service
     * @private
     */
    @service store;

    /**
     * Searches issues and reads the matched ones with their project.
     *
     * @method issues
     * @param {String} query the text the user typed
     * @param {Number} limit the most results to return
     * @return {Promise<Object>} `{ results: [{ issue, snippet, pinned }], semanticUnavailable }`, where snippet is
     *     the text parts of Gaia's snippet (see snippetParts); results are empty
     *     for a query shorter than MIN_QUERY_LENGTH, which Gaia would refuse
     */
    async issues(query, limit = 10) {
        let text = String(query ?? '').trim();
        if (text.length < SearchService.MIN_QUERY_LENGTH) {
            return { results: [], semanticUnavailable: false };
        }

        let matches = await this.store.query('searchresult', { types: 'issue', q: text, limit });
        let semanticUnavailable = matches.meta?.semantic === 'unavailable';
        // Read the records now: a later search can update them while the issue query below is awaited
        let found = matches.slice().map(({ recordId, snippet, pinned }) => ({ recordId, snippet, pinned }));
        let ids = found.map((match) => match.recordId);
        if (!ids.length) {
            return { results: [], semanticUnavailable };
        }

        let issues = await this.store.query('issue', {
            query: `(Issue.id CONTAINS ${ids.map((id) => `'${id}'`).join(',')})`,
            rels: 'project',
            limit: ids.length
        });
        let byId = new Map(issues.slice().map((issue) => [String(issue.id), issue]));

        // Keep the search's ranking; a match the issue query did not return is dropped
        let results = found
            .filter((match) => byId.has(String(match.recordId)))
            .map((match) => ({
                issue: byId.get(String(match.recordId)),
                snippet: snippetParts(match.snippet),
                pinned: match.pinned
            }));
        return { results, semanticUnavailable };
    }
}
