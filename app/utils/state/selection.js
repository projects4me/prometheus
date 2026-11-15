/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The selected rows of a list, kept across page changes, so the table and the toolbar of a list page share
 * one selection.
 *
 * Ids are kept as strings, so `1` and `'1'` are the same row. Lists page with `limit + 1` and send no totals
 * (see docs/architecture/lists/decisions.md), so there is no "select all matching": select-all works on the
 * rows shown, and rows selected on other pages stay selected.
 *
 * ```js
 * export default class AgentsController extends Controller {
 *     selection = new Selection();
 * }
 * ```
 *
 * ```hbs
 * <AppUi::DataTable @rows={{this.model}} @selectable={{true}} @selection={{this.selection}} />
 * ```
 *
 * @class Selection
 * @namespace Prometheus.Utils.State
 */
export default class Selection {
	/**
	 * The selected ids; replaced on every change, so readers re-render.
	 *
	 * @property _ids
	 * @type Set
	 * @private
	 */
	@tracked _ids = new Set();

	/**
	 * @constructor
	 * @param {Array} [ids] the ids selected at the start
	 */
	constructor(ids = []) {
		this._ids = new Set(ids.map(String));
	}

	/**
	 * The selected ids, in the order they were selected.
	 *
	 * @property ids
	 * @type Array
	 */
	get ids() {
		return [...this._ids];
	}

	/**
	 * How many ids are selected, across all pages.
	 *
	 * @property count
	 * @type Number
	 */
	get count() {
		return this._ids.size;
	}

	/**
	 * Whether an id is selected.
	 *
	 * @method has
	 * @param {String|Number} id the id
	 * @return {Boolean}
	 */
	has(id) {
		return this._ids.has(String(id));
	}

	/**
	 * Selects an id when it is not selected, else unselects it.
	 *
	 * @method toggle
	 * @param {String|Number} id the id
	 */
	toggle(id) {
		this.set([id], !this.has(id));
	}

	/**
	 * Selects (`on`) or unselects the ids.
	 *
	 * @method set
	 * @param {Array} ids the ids
	 * @param {Boolean} on whether they should be selected
	 */
	set(ids, on) {
		let next = new Set(this._ids);
		for (let id of ids) {
			if (on) {
				next.add(String(id));
			} else {
				next.delete(String(id));
			}
		}
		this._ids = next;
	}

	/**
	 * Unselects everything.
	 *
	 * @method clear
	 */
	clear() {
		this._ids = new Set();
	}

	/**
	 * How many of the given rows are selected.
	 *
	 * @method countIn
	 * @param {Array} rows records with an `id`
	 * @return {Number}
	 */
	countIn(rows) {
		return (rows || []).filter((row) => this.has(row.id)).length;
	}

	/**
	 * `none`, `some` or `all` of the given rows are selected; `none` when there are no rows.
	 *
	 * @method stateFor
	 * @param {Array} rows records with an `id`
	 * @return {String}
	 */
	stateFor(rows) {
		let total = (rows || []).length;
		let count = this.countIn(rows);
		return count === 0 ? 'none' : count === total ? 'all' : 'some';
	}
}
