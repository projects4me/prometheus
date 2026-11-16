/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Below this width (px) of the toolbar the search is narrow and the actions are asked to show icons only.
 *
 * @property NARROW_WIDTH
 * @type Number
 * @private
 */
export const NARROW_WIDTH = 600;

/**
 * The toolbar of a list: search and page actions in the box header, the controls row with the selection and the
 * pager. With `@selection` (the `Selection` the page also gives AppUi::DataTable) and `@rows` (the rows of the
 * current page) it shows the selection bar itself; without it the `<:selection>` block is used as before.
 *
 * Below NARROW_WIDTH it yields `narrow` to `<:actions>` and passes `@narrow` to the search through the
 * `<:search as |narrow|>` block.
 *
 * @class AppUiListToolbarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiListToolbarComponent extends Component {
	@tracked width = null;

	get narrow() {
		return this.width !== null && this.width < NARROW_WIDTH;
	}

	get selection() {
		return this.args.selection || null;
	}

	get count() {
		return this.selection ? this.selection.count : 0;
	}

	get rows() {
		return this.args.rows || [];
	}

	get onPage() {
		return this.selection ? this.selection.countIn(this.rows) : 0;
	}

	get onOtherPages() {
		return Math.max(this.count - this.onPage, 0);
	}

	get state() {
		return this.selection ? this.selection.stateFor(this.rows) : 'none';
	}

	get ids() {
		return this.selection ? this.selection.ids : [];
	}

	@action
	measure(width) {
		if (!this.isDestroying && !this.isDestroyed) {
			this.width = width;
		}
	}

	@action
	toggleAll() {
		this.selection.set(this.rows.map((row) => row.id), this.state !== 'all');
		this.args.onSelectionChange?.(this.selection.ids);
	}

	@action
	clear() {
		this.selection.clear();
		this.args.onSelectionChange?.(this.selection.ids);
	}
}
