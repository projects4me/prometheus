/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The state of one async load: its value, error and loading flag. Only the newest call to `run` writes its
 * result: every call takes a request token, and a response whose token is no longer the latest is dropped,
 * so two quick calls never show the older answer. An error keeps the previous value, so the page can show
 * the old data with the error and a retry. When an owner is given, nothing is written once it is destroying
 * or destroyed.
 *
 * ```javascript
 * this.details = new AsyncResource({
 *     owner: this,
 *     load: (id) => this.store.findRecord('issue', id)
 * });
 * this.details.run(issue.id);
 * ```
 *
 * @class AsyncResource
 * @namespace Prometheus.Utils.State
 */
export default class AsyncResource {
	/**
	 * The value of the newest load that succeeded, null before the first one
	 *
	 * @property value
	 * @type {*}
	 */
	@tracked value = null;

	/**
	 * The error of the newest load, null when it succeeded or is still running
	 *
	 * @property error
	 * @type {*}
	 */
	@tracked error = null;

	/**
	 * Whether the newest load is still running
	 *
	 * @property isLoading
	 * @type {Boolean}
	 */
	@tracked isLoading = false;

	/**
	 * The params of the newest load or seed, which `retry` runs again
	 *
	 * @property params
	 * @type {*}
	 */
	@tracked params = undefined;

	/**
	 * Whether a load ran or a value was seeded since the start or the last reset, so `retry` has params to
	 * run again (undefined params are valid, so `params` alone can't tell)
	 *
	 * @property hasParams
	 * @type {Boolean}
	 * @private
	 */
	hasParams = false;

	/**
	 * The token of the newest request; a response with an older token is dropped
	 *
	 * @property token
	 * @type {Number}
	 * @private
	 */
	token = 0;

	/**
	 * @constructor
	 * @param {Object} options
	 * @param {Function} options.load async function that loads the value for the given params
	 * @param {Object} [options.owner] the component or controller that owns the state; no writes once it is
	 *   destroying or destroyed
	 */
	constructor({ load, owner } = {}) {
		this.load = load;
		this.owner = owner;
	}

	/**
	 * Whether the owner is destroying or destroyed, so the state must not change any more
	 *
	 * @property isOwnerGone
	 * @type {Boolean}
	 * @readOnly
	 */
	get isOwnerGone() {
		return Boolean(this.owner?.isDestroying || this.owner?.isDestroyed);
	}

	/**
	 * Loads the value for the params. Errors are kept in `error`, not thrown.
	 *
	 * @method run
	 * @param {*} [params] passed to `load`
	 * @returns {Promise} the loaded value, or undefined when the load failed or a newer call replaced it
	 */
	async run(params) {
		if (this.isOwnerGone) {
			return undefined;
		}
		let token = ++this.token;
		this.params = params;
		this.hasParams = true;
		this.isLoading = true;
		this.error = null;
		try {
			let value = await this.load(params);
			if (!this.isCurrent(token)) {
				return undefined;
			}
			this.value = value;
			return value;
		} catch (error) {
			if (this.isCurrent(token)) {
				this.error = error;
			}
			return undefined;
		} finally {
			if (this.isCurrent(token)) {
				this.isLoading = false;
			}
		}
	}

	/**
	 * Runs the newest load again with the same params. Does nothing when nothing ran or was seeded since the
	 * start or the last reset.
	 *
	 * @method retry
	 * @returns {Promise} the loaded value, or undefined
	 */
	retry() {
		if (!this.hasParams) {
			return Promise.resolve(undefined);
		}
		return this.run(this.params);
	}

	/**
	 * Clears the value, error, loading flag and params, and drops any load still running
	 *
	 * @method reset
	 * @returns {void}
	 */
	reset() {
		this.token++;
		if (this.isOwnerGone) {
			return;
		}
		this.params = undefined;
		this.hasParams = false;
		this.value = null;
		this.error = null;
		this.isLoading = false;
	}

	/**
	 * Sets a value that was already loaded (for example by the route), and drops any load still running
	 *
	 * @method seed
	 * @param {*} value
	 * @param {*} [params] the params the value was loaded with, which `retry` uses
	 * @returns {void}
	 */
	seed(value, params) {
		this.token++;
		if (this.isOwnerGone) {
			return;
		}
		this.params = params;
		this.hasParams = true;
		this.value = value;
		this.error = null;
		this.isLoading = false;
	}

	/**
	 * Whether a response with the token may still write: it is the newest and the owner is alive
	 *
	 * @method isCurrent
	 * @param {Number} token
	 * @returns {Boolean}
	 * @private
	 */
	isCurrent(token) {
		return token === this.token && !this.isOwnerGone;
	}
}
