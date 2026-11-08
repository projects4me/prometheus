/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Standalone toolbar row for QuickList lists with Group by and Sort menus.
 *
 * @class QuickListToolbarComponent
 * @extends Component
 *
 * @argument {Array} groupOptions [{key, label}], "None" first
 * @argument {string} groupBy key of the current grouping
 * @argument {Function} onGroup called with the picked key
 * @argument {Array} sortOptions [{key, label}]
 * @argument {string} sort key of the current sort field
 * @argument {string} order 'asc' or 'desc'
 * @argument {Function} onSort called with (key, order)
 */
export default class QuickListToolbarComponent extends Component {
	get hasGroupOptions() {
		return (this.args.groupOptions ?? []).length > 0;
	}

	get hasSortOptions() {
		return (this.args.sortOptions ?? []).length > 0;
	}

	get groupLabel() {
		return this.args.groupOptions?.find((o) => o.key === this.args.groupBy)
			?.label;
	}

	get sortLabel() {
		return this.args.sortOptions?.find((o) => o.key === this.args.sort)
			?.label;
	}

	get orderIcon() {
		return this.args.order === 'asc'
			? 'fa-sort-amount-asc'
			: 'fa-sort-amount-desc';
	}

	@action
	selectGroup(key, event) {
		event?.preventDefault();
		this.args.onGroup?.(key);
	}

	/**
	 * Picking the current sort field again flips the order.
	 */
	@action
	selectSort(key, event) {
		event?.preventDefault();
		let order = 'asc';
		if (key === this.args.sort) {
			order = this.args.order === 'asc' ? 'desc' : 'asc';
		}
		this.args.onSort?.(key, order);
	}
}
