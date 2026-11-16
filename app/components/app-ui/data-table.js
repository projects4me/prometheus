/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { groupItems } from 'prometheus/utils/quick-list/group-items';

/**
 * A slim list table: one header per column descriptor, one row per record, an optional check button per row and
 * a row actions cell. It only displays what it is given; sorting and selection are reported out.
 *
 * A column is `{ key, label, sortable, sortKey, cell, class }`. A cell renders the `cell` component when the
 * column names one, else the `<:cell>` block when the caller gives it, else the record's `key` value.
 *
 * Like QuickList it can show a select-all box (`@selectedIds` and `@onSelectAll`; the owner keeps the ids, so the
 * selection survives paging), group rows (`@groupKey`, `@groupLabel`) and show a second line under a cell
 * (`column.subKey`). Sort icons are always visible and the applied one is marked with the primary colour.
 * Extra row actions go into the `<:moreActions>` block, shown in an AppUi::Dropdown behind a `fa-ellipsis-v` button.
 *
 * The row check buttons (the QuickList icon button, `aria-pressed`) carry `data-select` with the record id, so a page can find them by record.
 *
 * With `@selection` (a `Selection` from `utils/state/selection`) the row boxes and the select-all box (the rows
 * shown) read and change that selection, which the page shares with its toolbar and keeps across pages;
 * `@onSelectionChange` is then called with the selected ids. Without it, `@selectedIds`, `@onSelect` and
 * `@onSelectAll` work as before.
 *
 * @class AppUiDataTableComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::DataTable @columns={{this.columns}} @rows={{this.model}} @sort={{this.sort}} @order={{this.order}}
 *   @selectable={{true}} @onSort={{this.sortData}} @onSelect={{this.selectRow}}>
 *   <:cell as |record column|>{{get record column.key}}</:cell>
 *   <:rowActions as |record|><LinkTo @route="app.agent.edit" @model={{record.id}}>Edit</LinkTo></:rowActions>
 *   <:empty>Nothing here</:empty>
 * </AppUi::DataTable>
 */
export default class AppUiDataTableComponent extends Component {
	@tracked collapsed = [];
	@tracked localIds = [];

	/**
	 * The shared selection model, when the caller gives one.
	 *
	 * @property selection
	 * @type Selection
	 */
	get selection() {
		return this.args.selection || null;
	}

	get controlled() {
		return !!this.selection || Array.isArray(this.args.selectedIds);
	}

	get showSelectAll() {
		return this.args.selectable && (!!this.selection || typeof this.args.onSelectAll === 'function');
	}

	/**
	 * `none`, `some` or `all` of the shown rows are selected.
	 *
	 * @property selectionState
	 * @type String
	 */
	get selectionState() {
		if (this.selection) {
			return this.selection.stateFor(this.rows);
		}
		let ids = (this.args.selectedIds || []).map(String);
		let count = this.rows.filter((r) => ids.includes(String(r.id))).length;
		return count === 0 ? 'none' : count === this.rows.length ? 'all' : 'some';
	}

	/**
	 * The rows in sections: one headed section per group when `@groupKey` is given, else one plain section.
	 *
	 * @property sections
	 * @type Array
	 */
	get sections() {
		if (typeof this.args.groupKey !== 'function') {
			return [{ plain: true, items: this.rows }];
		}
		return groupItems(this.rows, { groupKey: this.args.groupKey, groupLabel: this.args.groupLabel }).map((g) => ({
			...g,
			isCollapsed: this.collapsed.includes(g.key),
		}));
	}

	isSelected = (record) => {
		if (this.selection) {
			return this.selection.has(record.id);
		}
		let ids = this.controlled ? this.args.selectedIds : this.localIds;
		return ids.map(String).includes(String(record.id));
	};

	/**
	 * The column descriptors with their sort key and sort icon.
	 *
	 * @property columns
	 * @type Array
	 */
	get columns() {
		return (this.args.columns || []).map((column) => {
			let sortKey = column.sortKey || column.key;
			let icon = 'fa-sort';
			let active = !!column.sortable && sortKey === this.args.sort;
			if (active) {
				icon = this.args.order === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
			}
			return { ...column, sortKey, sortIcon: icon, active };
		});
	}

	/**
	 * The records to show.
	 *
	 * @property rows
	 * @type Array
	 */
	get rows() {
		let rows = this.args.rows;
		return rows ? (Array.isArray(rows) ? rows : rows.slice()) : [];
	}

	/**
	 * Reports a sort request for a sortable column.
	 *
	 * @method sort
	 * @param {Object} column the column descriptor
	 */
	@action
	sort(column) {
		this.args.onSort?.(column.sortKey);
	}

	@action
	toggleAll() {
		let checked = this.selectionState !== 'all';
		if (this.selection) {
			this.selection.set(this.rows.map((r) => r.id), checked);
			this.args.onSelectionChange?.(this.selection.ids);
			return;
		}
		this.args.onSelectAll?.(this.rows, checked);
	}

	@action
	toggleGroup(key) {
		this.collapsed = this.collapsed.includes(key) ? this.collapsed.filter((k) => k !== key) : [...this.collapsed, key];
	}

	/**
	 * Reports that a row was checked or unchecked; with `@selection`, changes it and reports the ids.
	 *
	 * @method select
	 * @param {Object} record the record of the row
	 * 	 */
	@action
	select(record) {
		let checked = !this.isSelected(record);
		if (this.selection) {
			this.selection.set([record.id], checked);
			this.args.onSelectionChange?.(this.selection.ids);
			return;
		}
		if (!this.controlled) {
			let id = String(record.id);
			this.localIds = checked ? [...this.localIds, id] : this.localIds.filter((i) => i !== id);
		}
		this.args.onSelect?.(String(record.id), checked);
	}
}
