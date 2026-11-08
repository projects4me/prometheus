/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The selected record ids of a QuickList. Ids are kept as strings, so a numeric id matches an Ember
 * Data id. Every change calls `onChange` with the array of selected ids.
 *
 * @class Selection
 * @namespace Prometheus.Utils.QuickList
 */
export default class Selection {
	@tracked _ids = [];

	/**
	 * @property ids
	 * @type {Array} of String
	 * @readOnly
	 */
	get ids() {
		return this._ids;
	}

	/**
	 * @param {Function} [onChange] called with the selected ids after every change
	 */
	constructor(onChange) {
		this.onChange = onChange;
	}

	get count() {
		return this.ids.length;
	}

	has(id) {
		return this.ids.includes(String(id));
	}

	/**
	 * `none`, `some` or `all` of the given items are selected.
	 *
	 * @method state
	 * @param {Array} items records with an `id`
	 * @return {String}
	 */
	state(items) {
		let count = items.filter((item) => !!item && this.has(item.id)).length;
		if (count === 0) {
			return 'none';
		}
		return count === items.length ? 'all' : 'some';
	}

	toggle(id) {
		let key = String(id);
		this.#set(this.has(key) ? this.ids.filter((i) => i !== key) : [...this.ids, key]);
	}

	/**
	 * Selects every item, or clears the selection when all are selected.
	 *
	 * @method toggleAll
	 * @param {Array} items records with an `id`
	 */
	toggleAll(items) {
		this.#set(this.state(items) === 'all' ? [] : items.filter((item) => !!item).map((item) => String(item.id)));
	}

	clear() {
		this.#set([]);
	}

	#set(ids) {
		this._ids = ids;
		this.onChange?.(ids);
	}
}
