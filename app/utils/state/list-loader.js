/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AsyncResource from 'prometheus/utils/state/async-resource';
import { hasNextPage } from 'prometheus/utils/quick-list/page-window';

/**
 * The records of a query result as an array, an empty array when there is none
 *
 * @param {*} records
 * @returns {Array}
 */
function toItems(records) {
	if (!records) {
		return [];
	}
	return typeof records.toArray === 'function' ? records.toArray() : Array.from(records);
}

/**
 * Loads one page of a list with `store.query`, on top of an `AsyncResource`, so the newest call wins and the
 * loading flag, error and retry come for free. Paging follows the page window of the list decisions
 * (docs/architecture/lists/decisions.md, D-001): the query sends a plain `limit` of the page size, Gaia reads
 * one row more itself and links `meta.links.next` when there is a next page, and `hasNext` reads that link.
 * No totals are asked for.
 *
 * `buildRequest(params)` builds the query options and `request(params)` adds the limit; a route that loads
 * the first page must call `request` too, so both build the same query. `request` runs inside the load, so
 * an error thrown by `buildRequest` during `run` or `retry` lands in `error` like a failed query.
 *
 * ```javascript
 * this.ideas = new ListLoader({
 *     store: this.store,
 *     modelName: 'idea',
 *     pageSize: 20,
 *     owner: this,
 *     buildRequest: ({ query, page }) => ({ query, page })
 * });
 * this.ideas.run({ query: '', page: 1 });
 * ```
 *
 * @class ListLoader
 * @namespace Prometheus.Utils.State
 */
export default class ListLoader {
	/**
	 * The query result `itemsCache` was built from
	 *
	 * @property itemsSource
	 * @type {*}
	 * @private
	 */
	itemsSource = undefined;

	/**
	 * The array `items` returns, kept until the loaded value changes so templates see a stable array
	 *
	 * @property itemsCache
	 * @type {Array}
	 * @private
	 */
	itemsCache = [];

	/**
	 * @constructor
	 * @param {Object} options
	 * @param {Object} options.store the Ember Data store
	 * @param {String} options.modelName the model to query
	 * @param {Number} options.pageSize the rows of a page, sent as `limit`
	 * @param {Function} options.buildRequest builds the query options (without `limit`) from the params
	 * @param {Object} [options.owner] the component or controller that owns the list; no writes once it is
	 *   destroying or destroyed
	 */
	constructor({ store, modelName, pageSize, buildRequest, owner } = {}) {
		this.store = store;
		this.modelName = modelName;
		this.pageSize = pageSize;
		this.buildRequest = buildRequest;
		this.resource = new AsyncResource({
			owner,
			load: (params) => this.store.query(this.modelName, this.request(params))
		});
	}

	/**
	 * The query options for the params: `buildRequest(params)` with `limit` set to the page size
	 *
	 * @method request
	 * @param {*} [params]
	 * @returns {Object}
	 */
	request(params) {
		return { ...this.buildRequest(params), limit: this.pageSize };
	}

	/**
	 * The records of the loaded page, an empty array before the first load
	 *
	 * @property items
	 * @type {Array}
	 * @readOnly
	 */
	get items() {
		let records = this.resource.value;
		if (records !== this.itemsSource) {
			this.itemsSource = records;
			this.itemsCache = toItems(records);
		}
		return this.itemsCache;
	}

	/**
	 * Whether Gaia linked a next page (`meta.links.next`) in the loaded response
	 *
	 * @property hasNext
	 * @type {Boolean}
	 * @readOnly
	 */
	get hasNext() {
		return hasNextPage(this.resource.value?.meta);
	}

	/**
	 * Whether the newest page load is still running
	 *
	 * @property isLoading
	 * @type {Boolean}
	 * @readOnly
	 */
	get isLoading() {
		return this.resource.isLoading;
	}

	/**
	 * The error of the newest page load; the previous page stays in `items`
	 *
	 * @property error
	 * @type {*}
	 * @readOnly
	 */
	get error() {
		return this.resource.error;
	}

	/**
	 * The params of the newest load or seed
	 *
	 * @property params
	 * @type {*}
	 * @readOnly
	 */
	get params() {
		return this.resource.params;
	}

	/**
	 * Loads the page for the params
	 *
	 * @method run
	 * @param {*} [params]
	 * @returns {Promise} the loaded records, or undefined when the load failed or a newer call replaced it
	 */
	run(params) {
		return this.resource.run(params);
	}

	/**
	 * Loads the newest page again
	 *
	 * @method retry
	 * @returns {Promise}
	 */
	retry() {
		return this.resource.retry();
	}

	/**
	 * Clears the page and drops any load still running
	 *
	 * @method reset
	 * @returns {void}
	 */
	reset() {
		this.resource.reset();
	}

	/**
	 * Shows a page that was already loaded, for example by the route with `request(params)`
	 *
	 * @method seed
	 * @param {Object} records the query result; its `meta` links the next page, and without `meta` (a plain
	 *   array) `hasNext` is false
	 * @param {*} [params] the params the page was loaded with
	 * @returns {void}
	 */
	seed(records, params) {
		this.resource.seed(records, params);
	}
}
