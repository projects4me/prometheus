/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import ENV from 'prometheus/config/environment';

/**
 * Batches independent store queries into one `POST /api/v1/bulk` request (Gaia's bulk resource,
 * gaia/docs/architecture/bulk/decisions.md) and returns ordinary Ember Data records.
 *
 * Each item is `{ id, modelName, query }`, where `query` is the options object a route would pass to
 * `store.query(modelName, query)`. `query(items)` resolves to a map `id → { records, meta }` or
 * `id → { error }`; one failing item never affects the others. When the bulk call itself fails
 * (no bulk.create permission, network error, a non-200 answer) the items run as separate
 * `store.query` calls and come back in the same shape. See docs/architecture/bulk/.
 *
 * @class BulkService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class BulkService extends Service {
    /**
     * Ember Data store the records land in.
     *
     * @property store
     * @type Ember.Service
     * @public
     */
    @service store;

    /**
     * The most calls one bulk request may hold; larger batches are split.
     *
     * @property maxRequests
     * @type Number
     * @public
     */
    get maxRequests() {
        return ENV.APP.bulkMaxRequests;
    }

    /**
     * Runs the queries in as few bulk requests as the limit allows. Batches above the limit are sent
     * one after another (Gaia runs each batch under one PHP time limit); once a bulk request fails,
     * that batch and the remaining ones run as separate store.query calls.
     *
     * @method query
     * @param {Array<{id: String, modelName: String, query: Object}>} items The queries, ids unique
     * @return {Promise<Object>} id → { records, meta } or { error }
     * @public
     */
    async query(items) {
        this._assertUniqueIds(items);

        let results = {};
        let failure = null;

        for (let chunk of this._chunk(items, this.maxRequests)) {
            // built outside the try: a bad modelName is a programming error, not a reason to fall back
            let requests = chunk.map((item) => this._requestFor(item));
            let responses = null;

            if (!failure) {
                try {
                    responses = await this._send(requests);
                } catch (error) {
                    failure = error;
                }
            }

            Object.assign(results, responses
                ? this._resultsFor(chunk, requests, responses)
                : await this._runSeparately(chunk));
        }

        if (failure) {
            console.warn('bulk: the bulk request failed; ran the queries as separate requests instead.', failure);
        }

        return results;
    }

    /**
     * The relative URL (`/api/v1/...?...`) store.query sends for this model and query: the model's
     * adapter builds it exactly as its query() does.
     *
     * @method urlFor
     * @param {String} modelName The model name
     * @param {Object} query The store.query options
     * @return {String} The relative URL with its serialized query string
     * @public
     */
    urlFor(modelName, query = {}) {
        let adapter = this.store.adapterFor(modelName);
        let url = adapter.buildURL(modelName, null, null, 'query', query);
        let data = adapter.sortQueryParams ? adapter.sortQueryParams(query) : query;

        return this._relative(adapter, adapter.ajaxOptions(url, 'GET', { data }).url);
    }

    /**
     * The bulk item for one query.
     *
     * @method _requestFor
     * @param {Object} item The query item
     * @return {Object} { id, method, url, body }
     * @private
     */
    _requestFor(item) {
        return { id: item.id, method: 'GET', url: this.urlFor(item.modelName, item.query), body: null };
    }

    /**
     * Sends one bulk request through the application adapter (token refresh, 401 retry, test waiter).
     *
     * @method _send
     * @param {Array} requests The bulk items
     * @return {Promise<Array>} The bulk responses
     * @throws when the request fails or the answer has no responses
     * @private
     */
    async _send(requests) {
        let adapter = this.store.adapterFor('application');
        let payload = await adapter.ajax(adapter.buildURL('bulk'), 'POST', { data: { requests } });

        if (!Array.isArray(payload?.responses)) {
            throw new Error('bulk: the answer has no responses');
        }

        return payload.responses;
    }

    /**
     * Matches the bulk responses to their items by id.
     *
     * @method _resultsFor
     * @param {Array} items The items of this batch
     * @param {Array} requests Their bulk items, in the same order
     * @param {Array} responses The bulk responses
     * @return {Object} id → result
     * @private
     */
    _resultsFor(items, requests, responses) {
        let adapter = this.store.adapterFor('application');
        let byId = new Map(responses.map((response) => [response.id, response]));
        let results = {};

        items.forEach((item, index) => {
            results[item.id] = this._resultFor(adapter, item, byId.get(item.id), requests[index].url);
        });

        return results;
    }

    /**
     * Pushes a successful response into the store, or turns a failed one into the adapter's error.
     *
     * @method _resultFor
     * @param {Object} adapter The application adapter
     * @param {Object} item The query item
     * @param {Object} response Its bulk response, if any
     * @param {String} url The URL the item was sent with
     * @return {Object} { records, meta } or { error }
     * @private
     */
    _resultFor(adapter, item, response, url) {
        if (!response) {
            return { error: new Error(`bulk: no response for "${item.id}"`) };
        }

        let body = response.body ?? {};

        if (response.status < 200 || response.status >= 300) {
            return { error: adapter.handleResponse(response.status, {}, body, { method: 'GET', url }) };
        }

        try {
            let modelClass = this.store.modelFor(item.modelName);
            let serializer = this.store.serializerFor(item.modelName);
            let normalized = serializer.normalizeResponse(this.store, modelClass, body, null, 'query');
            let records = this.store.push(normalized);

            return { records: Array.isArray(records) ? records : [records].filter(Boolean), meta: normalized.meta };
        } catch (error) {
            return { error };
        }
    }

    /**
     * Fallback: runs each item as its own store.query, in parallel, with the same result shape.
     *
     * @method _runSeparately
     * @param {Array} items The items of the failed batch
     * @return {Promise<Object>} id → result
     * @private
     */
    async _runSeparately(items) {
        let settled = await Promise.allSettled(items.map((item) => this.store.query(item.modelName, item.query)));
        let results = {};

        items.forEach((item, index) => {
            let outcome = settled[index];

            results[item.id] = outcome.status === 'fulfilled'
                ? { records: [...outcome.value], meta: outcome.value.meta }
                : { error: outcome.reason };
        });

        return results;
    }

    /**
     * Gaia refuses a batch with a missing or repeated id, and the result map is keyed by id.
     *
     * @method _assertUniqueIds
     * @param {Array} items The query items
     * @return {void}
     * @private
     */
    _assertUniqueIds(items) {
        let ids = new Set();

        for (let item of items) {
            if (!item.id || ids.has(item.id)) {
                throw new Error(`bulk: every item needs a unique id ("${item.id}")`);
            }
            ids.add(item.id);
        }
    }

    /**
     * Splits the items into batches of at most `size`.
     *
     * @method _chunk
     * @param {Array} items The items
     * @param {Number} size The batch size
     * @return {Array<Array>} The batches
     * @private
     */
    _chunk(items, size) {
        let chunks = [];

        for (let start = 0; start < items.length; start += size) {
            chunks.push(items.slice(start, start + size));
        }

        return chunks;
    }

    /**
     * Drops the adapter's host so the URL is the relative `/api/v1/...` path Gaia's bulk resource expects.
     *
     * @method _relative
     * @param {Object} adapter The model's adapter
     * @param {String} url The absolute or host-relative URL
     * @return {String} The relative URL
     * @private
     */
    _relative(adapter, url) {
        let host = adapter.host || '';
        let path = host && url.startsWith(host) ? url.slice(host.length) : url;

        return path.startsWith('/') ? path : `/${path}`;
    }
}
