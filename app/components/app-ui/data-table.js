/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * A slim list table: one header per column descriptor, one row per record, an optional checkbox per row and
 * a row actions cell. It only displays what it is given; sorting and selection are reported out.
 *
 * A column is `{ key, label, sortable, sortKey, cell, class }`. A cell renders the `cell` component when the
 * column names one, else the `<:cell>` block when the caller gives it, else the record's `key` value.
 *
 * The row checkboxes carry `data-select` with the record id, so a page can find them by record.
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
			if (column.sortable && sortKey === this.args.sort) {
				icon = this.args.order === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
			}
			return { ...column, sortKey, sortIcon: icon };
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

	/**
	 * Reports that a row was checked or unchecked.
	 *
	 * @method select
	 * @param {Object} record the record of the row
	 * @param {Event} event the input event of the checkbox
	 */
	@action
	select(record, event) {
		this.args.onSelect?.(String(record.id), event.target.checked);
	}
}
