/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import ENV from 'prometheus/config/environment';
import snippetParts from 'prometheus/utils/search/snippet-parts';
import { waitForPromise } from '@ember/test-waiters';

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
     * @property session
     * @type Service
     * @private
     */
    @service session;

    /**
     * Searches issues and reads the matched ones with their project.
     *
     * @method issues
     * @param {String} query the text the user typed
     * @param {Number} limit the most results to return
     * @return {Promise<Array>} `[{ issue, snippet, pinned }]`, where snippet is the text parts of Gaia's snippet
     *     (see snippetParts); empty for a query shorter than MIN_QUERY_LENGTH, which Gaia would refuse
     */
    async issues(query, limit = 10) {
        let text = String(query ?? '').trim();
        if (text.length < SearchService.MIN_QUERY_LENGTH) {
            return [];
        }

        let params = new URLSearchParams({ types: 'issue', q: text, limit });
        // Native fetch is not waited for by the test helpers; the waiter keeps settled() waiting (as the adapter does)
        let response = await waitForPromise(fetch(`${ENV.api.host}/api/v${ENV.api.version}/search?${params}`, {
            headers: { Authorization: `Bearer ${this.session.data.authenticated.access_token}` }
        }));
        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }
        let body = await waitForPromise(response.json());
        let found = (body.data ?? []).map(({ attributes }) => attributes);
        let ids = found.map((match) => match.recordId);
        if (!ids.length) {
            return [];
        }

        let issues = await this.store.query('issue', {
            query: `(Issue.id CONTAINS ${ids.map((id) => `'${id}'`).join(',')})`,
            rels: 'project',
            limit: ids.length
        });
        let byId = new Map(issues.slice().map((issue) => [String(issue.id), issue]));

        // Keep the search's ranking; a match the issue query did not return is dropped
        return found
            .filter((match) => byId.has(String(match.recordId)))
            .map((match) => ({
                issue: byId.get(String(match.recordId)),
                snippet: snippetParts(match.snippet),
                pinned: match.pinned
            }));
    }
}
