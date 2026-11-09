/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { getOwner } from '@ember/application';
import { registerDestructor } from '@ember/destroyable';
import { get, setProperties } from '@ember/object';

const TYPES = ['string', 'number', 'boolean'];

/**
 * Page state kept in a controller's query params, read and written as typed values, so a page can keep
 * its state in the URL without refreshing its route.
 *
 * Build it in the controller with a schema of that controller's query params:
 *
 * ```js
 * export default class IdeasController extends Controller {
 *     queryParams = ['query', 'page', 'archived'];
 *     query = '';
 *     page = 1;
 *     archived = false;
 *
 *     urlState = new UrlState(this, {
 *         schema: {
 *             query: { default: '', type: 'string' },
 *             page: { default: 1, type: 'number', resetOnChange: true },
 *             archived: { default: false, type: 'boolean' },
 *         },
 *         routeName: 'app.project.ideas',
 *     });
 *
 *     constructor() {
 *         super(...arguments);
 *         this.urlState.onChange((values, changed) => this.load(values, changed));
 *     }
 * }
 * ```
 *
 * The route declares the params with `UrlState.queryParamsConfig(schema)` (no route refresh) and resets
 * them in `resetController` with `UrlState.resetController(controller)`.
 *
 * A schema entry is `{ default, type, resetOnChange }`: `type` is `string`, `number` or `boolean`;
 * `resetOnChange: true` (meant for `page`) puts the param back to its default whenever `set` changes any
 * other param without also setting this one.
 *
 * `onChange` callbacks run with `(values, changedNames)` whenever the params differ from the last values
 * handled: after `set`, after a link changed them, and after browser back/forward (the router service's
 * `routeDidChange` for the owning route). The router listener is removed when the controller is destroyed.
 *
 * @class UrlState
 * @namespace Prometheus.Utils.State
 */
export default class UrlState {
	/**
	 * The route `queryParams` for a schema: every param with `refreshModel: false`, so changing it does
	 * not refresh the route's model.
	 *
	 * @method queryParamsConfig
	 * @static
	 * @param {Object} schema the UrlState schema
	 * @return {Object} route queryParams config
	 */
	static queryParamsConfig(schema) {
		let config = {};
		for (let name of Object.keys(schema)) {
			config[name] = { refreshModel: false };
		}
		return config;
	}

	/**
	 * The reset hook for a route's `resetController`. Ember calls `resetController` when the route is left
	 * and when its model changes (e.g. switching project); this puts the params back to their defaults
	 * without calling `onChange`, so the next visit starts clean:
	 *
	 * ```js
	 * resetController(controller, isExiting, transition) {
	 *     super.resetController(controller, isExiting, transition);
	 *     UrlState.resetController(controller);
	 * }
	 * ```
	 *
	 * @method resetController
	 * @static
	 * @param {Controller} controller the route's controller
	 * @param {String} [property=urlState] the controller property holding the UrlState
	 */
	static resetController(controller, property = 'urlState') {
		controller?.[property]?.resetToDefaults({ silent: true });
	}

	#controller;
	#router;
	#routeName;
	#callbacks = [];
	#lastValues;
	#destroyed = false;

	/**
	 * @constructor
	 * @param {Controller} controller the controller owning the query params
	 * @param {Object} options
	 * @param {Object} options.schema `{ name: { default, type, resetOnChange } }`
	 * @param {String} [options.routeName] the owning route; route changes to other routes are ignored
	 * @param {RouterService} [options.router] defaults to the controller owner's `service:router`
	 */
	constructor(controller, { schema, routeName, router } = {}) {
		this.#controller = controller;
		this.schema = UrlState.#validate(schema);
		this.#routeName = routeName;
		this.#router = router ?? getOwner(controller)?.lookup('service:router');
		if (!this.#router) {
			throw new Error('UrlState: no router; pass options.router or create it on an owned controller');
		}
		this.#lastValues = this.values;

		this.#router.on('routeDidChange', this.#onRouteDidChange);
		registerDestructor(controller, () => this.destroy());
	}

	/**
	 * The current param values, parsed to their schema types; a missing or unparseable value is its default.
	 *
	 * @property values
	 * @type {Object}
	 * @readOnly
	 */
	get values() {
		let values = {};
		for (let [name, entry] of Object.entries(this.schema)) {
			values[name] = UrlState.#parse(get(this.#controller, name), entry);
		}
		return values;
	}

	/**
	 * Updates the params. Values equal to the current ones change nothing; a param with `resetOnChange`
	 * goes back to its default when another param changes. Calls `onChange` when anything changed.
	 *
	 * @method set
	 * @param {Object} changes `{ name: value }`
	 */
	set(changes) {
		let current = this.values;
		let next = {};
		for (let [name, value] of Object.entries(changes)) {
			let entry = this.#entry(name);
			let parsed = UrlState.#parse(value, entry);
			if (parsed !== current[name]) {
				next[name] = parsed;
			}
		}
		if (Object.keys(next).length === 0) {
			return;
		}
		for (let [name, entry] of Object.entries(this.schema)) {
			if (entry.resetOnChange && !(name in changes) && current[name] !== entry.default) {
				next[name] = entry.default;
			}
		}
		setProperties(this.#controller, next);
		this.#notifyIfChanged();
	}

	/**
	 * Puts every param back to its default.
	 *
	 * @method resetToDefaults
	 * @param {Object} [options]
	 * @param {Boolean} [options.silent=false] when true, record the defaults as handled without calling `onChange`
	 */
	resetToDefaults({ silent = false } = {}) {
		let defaults = {};
		for (let [name, entry] of Object.entries(this.schema)) {
			defaults[name] = entry.default;
		}
		setProperties(this.#controller, defaults);
		if (silent) {
			this.#lastValues = this.values;
		} else {
			this.#notifyIfChanged();
		}
	}

	/**
	 * @method isDefault
	 * @param {String} name a schema param
	 * @return {Boolean} true when the param has its default value
	 */
	isDefault(name) {
		return this.values[name] === this.#entry(name).default;
	}

	/**
	 * Registers a callback for param changes. A callback that throws does not stop the others; the first
	 * error is rethrown after all callbacks ran.
	 *
	 * @method onChange
	 * @param {Function} callback called with `(values, changedNames)`
	 * @return {Function} removes the callback
	 */
	onChange(callback) {
		this.#callbacks.push(callback);
		return () => {
			this.#callbacks = this.#callbacks.filter((cb) => cb !== callback);
		};
	}

	/**
	 * Stops listening to the router and drops the callbacks. Runs when the controller is destroyed.
	 *
	 * @method destroy
	 */
	destroy() {
		if (this.#destroyed) {
			return;
		}
		this.#destroyed = true;
		this.#router.off('routeDidChange', this.#onRouteDidChange);
		this.#callbacks = [];
	}

	#onRouteDidChange = (transition) => {
		if (this.#destroyed || !this.#isOwningRoute(transition?.to)) {
			return;
		}
		this.#notifyIfChanged();
	};

	#isOwningRoute(routeInfo) {
		if (!this.#routeName) {
			return true;
		}
		for (let info = routeInfo; info; info = info.parent) {
			if (info.name === this.#routeName) {
				return true;
			}
		}
		return false;
	}

	#notifyIfChanged() {
		let values = this.values;
		let changed = Object.keys(values).filter((name) => values[name] !== this.#lastValues[name]);
		if (changed.length === 0) {
			return;
		}
		this.#lastValues = values;
		let errors = [];
		for (let callback of [...this.#callbacks]) {
			try {
				callback(values, changed);
			} catch (error) {
				errors.push(error);
			}
		}
		if (errors.length > 0) {
			throw errors[0];
		}
	}

	#entry(name) {
		let entry = this.schema[name];
		if (!entry) {
			throw new Error(`UrlState: unknown param "${name}"`);
		}
		return entry;
	}

	static #parse(value, entry) {
		if (value === undefined || value === null || (value === '' && entry.type !== 'string')) {
			return entry.default;
		}
		switch (entry.type) {
			case 'number': {
				let number = typeof value === 'number' ? value : Number(value);
				return Number.isFinite(number) ? number : entry.default;
			}
			case 'boolean':
				if (value === true || value === 'true') {
					return true;
				}
				if (value === false || value === 'false') {
					return false;
				}
				return entry.default;
			default:
				return String(value);
		}
	}

	static #validate(schema) {
		if (!schema || typeof schema !== 'object' || Object.keys(schema).length === 0) {
			throw new Error('UrlState: a schema with at least one param is required');
		}
		for (let [name, entry] of Object.entries(schema)) {
			if (!TYPES.includes(entry?.type)) {
				throw new Error(`UrlState: param "${name}" needs a type of ${TYPES.join(', ')}`);
			}
			if (UrlState.#parse(entry.default, entry) !== entry.default) {
				throw new Error(`UrlState: the default of "${name}" is not a ${entry.type}`);
			}
		}
		return schema;
	}
}
