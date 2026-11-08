/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';
import { groupItems } from 'prometheus/utils/quick-list/group-items';

/**
 * A narrow list of records inside a `box box-primary`: a header with the title and count, an optional
 * search slot, one row per record and the loading, empty and error states.
 *
 * QuickList only displays what it is given. It never loads data: the caller owns the queries, the
 * paging and the search, and passes the results and the request state in through the arguments.
 *
 * Arguments:
 * - `@items` {Array}: the records to show, one row each.
 * - `@total` {Number}: optional total number of matching records. When it differs from the number of
 *   items shown, the header reads `shown of total` (for example `0 of 64`); otherwise it shows the count.
 * - `@activeId` {String|Number}: id of the record that is open; its row gets the active bar.
 * - `@isLoading` {Boolean}: shows three skeleton rows instead of the items.
 * - `@error` {*}: any truthy value shows the error state instead of the items.
 * - `@onRetry` {Function}: called by the "Try again" button of the error state; the button is hidden
 *   without it.
 * - `@onClearSearch` {Function}: called by the "Clear the search" button of the default empty state;
 *   the button is hidden without it.
 * - `@title` {String}: the box title, already translated.
 *
 * Named blocks:
 * - `<:actions>`: header tools, rendered in the header's `box-tools`.
 * - `<:search>`: a slot under the header for `<EzSearchCompact>`; rendered as is, without a wrapper.
 * - `<:item as |record Item|>`: one row per record. `Item` is `QuickList::Item` with `@isActive`
 *   already set from `@activeId`; pass it `@route`/`@model` and fill its `<:primary>` and `<:secondary>`
 *   blocks.
 * - `<:empty>`: replaces the default empty state ("No records found.").
 * - `<:group as |group|>`: replaces the label of a group heading (`group` is `{ key, label, items, count }`).
 * - `<:selectionActions as |selected clear|>`: the actions in the selection bar; `selected` is the
 *   array of selected ids and `clear` clears the selection.
 *
 * Paging (`QuickList::Pagination`, under the items, shown when `@onPage` is passed):
 * - `@page` {Number}, `@limit` {Number}: the current page and the page size; `@total` is the record count.
 * - `@onPage` {Function}: called with the new page number. The buttons are disabled while `@isLoading`.
 *
 * Grouping and sorting (`QuickList::Toolbar` under the search when any option is given or `@selectable`):
 * - `@groupOptions` {Array} of `{ key, label, groupKey, groupLabel }`, `@groupBy` {String}, `@onGroup(key)`.
 *   With `@groupBy` set the items are grouped with `groupItems` and rendered in `QuickList::Group`;
 *   collapsed groups are remembered per `@groupBy` for the lifetime of the component.
 * - `@sortOptions` {Array} of `{ key, label }`, `@sort` {String}, `@order` {String}, `@onSort(key, order)`.
 *
 * Selection:
 * - `@selectable` {Boolean}: adds a checkbox to every row and a select-all box to the toolbar. While
 *   anything is selected the selection bar replaces the toolbar.
 * - `@onSelect` {Function}: called with the array of selected ids on every change. The selection is
 *   cleared when `@items` changes (another page or search). Only the shown page can be selected.
 *
 * @class QuickListComponent
 * @extends Component
 * @author Agent Odysseus
 *
 * @example
 * <QuickList @title={{t "views.app.idea.list.title"}} @items={{this.ideas}} @total={{this.total}}
 *            @activeId={{this.ideaId}} @isLoading={{this.isLoading}} @error={{this.error}}
 *            @onRetry={{this.reload}} @onClearSearch={{this.clearSearch}}>
 *   <:actions>
 *     <button type="button" class="btn btn-box-tool"><i class="fa fa-plus"></i></button>
 *   </:actions>
 *   <:search>
 *     <EzSearchCompact @schema={{this.schema}} @onApply={{this.search}} />
 *   </:search>
 *   <:item as |idea Item|>
 *     <Item @route="app.idea.page" @model={{idea.id}}>
 *       <:primary>
 *         <span>{{idea.name}}</span>
 *         <span class="label {{idea.status}}">{{idea.status}}</span>
 *       </:primary>
 *       <:secondary>{{idea.createdUserName}}</:secondary>
 *     </Item>
 *   </:item>
 * </QuickList>
 */
export default class QuickListComponent extends Component {
	/**
	 * Placeholder rows shown while `@isLoading` is set.
	 *
	 * @property skeletonRows
	 * @type {Array}
	 * @public
	 */
	skeletonRows = [1, 2, 3];

	/**
	 * The records to show, or an empty list when `@items` is not passed.
	 *
	 * @property items
	 * @type {Array}
	 * @public
	 */
	get items() {
		return this.args.items ?? [];
	}

	/**
	 * Whether there is nothing to show: not loading, no error and no items.
	 *
	 * @property isEmpty
	 * @type {Boolean}
	 * @public
	 */
	get isEmpty() {
		return !this.args.isLoading && !this.args.error && this.items.length === 0;
	}

	/**
	 * Whether the header shows the count; hidden while loading or after an error.
	 *
	 * @property showCount
	 * @type {Boolean}
	 * @public
	 */
	get showCount() {
		return !this.args.isLoading && !this.args.error;
	}

	/**
	 * Ids of the selected records (current page only).
	 *
	 * @property selectedIds
	 * @type {Array}
	 * @public
	 */
	@tracked selectedIds = [];

	/**
	 * Collapsed group keys, per `@groupBy`, so a grouping remembers its state while the component lives.
	 *
	 * @property collapsed
	 * @type {Object}
	 * @private
	 */
	@tracked collapsed = {};

	/**
	 * The items paired with whether each one is the open record (`@activeId`) and whether it is
	 * selected. Ids are compared as strings, so a numeric `@activeId` matches an Ember Data id.
	 *
	 * @property rows
	 * @type {Array} of `{ record, isActive, isSelected }`
	 * @public
	 */
	get rows() {
		let activeId = this.args.activeId;
		let hasActive = activeId !== undefined && activeId !== null;
		let selected = this.selectedIds.map(String);
		return this.items.map((record) => ({
			record,
			isActive: hasActive && !!record && String(record.id) === String(activeId),
			isSelected: !!record && selected.includes(String(record.id)),
		}));
	}

	/**
	 * The groups for `@groupBy` as `{ group, key, collapsed, rows }`, or null when not grouping.
	 *
	 * @property groups
	 * @type {Array|null}
	 * @public
	 */
	get groups() {
		let option = (this.args.groupOptions ?? []).find((o) => o.key === this.args.groupBy);
		if (!this.args.groupBy || !option) {
			return null;
		}
		let collapsed = this.collapsed[this.args.groupBy] ?? [];
		let rowOf = new Map(this.rows.map((row) => [row.record, row]));
		return groupItems(this.items, option).map((group) => ({
			group,
			key: group.key,
			collapsed: collapsed.includes(group.key),
			rows: group.items.map((record) => rowOf.get(record)),
		}));
	}

	/**
	 * Whether the toolbar is shown: any group or sort option, or `@selectable`.
	 *
	 * @property showToolbar
	 * @type {Boolean}
	 * @public
	 */
	get showToolbar() {
		return (
			!!this.args.selectable ||
			(this.args.groupOptions ?? []).length > 0 ||
			(this.args.sortOptions ?? []).length > 0
		);
	}

	/**
	 * `none`, `some` or `all` of the shown items are selected.
	 *
	 * @property selectionState
	 * @type {String}
	 * @public
	 */
	get selectionState() {
		let count = this.rows.filter((row) => row.isSelected).length;
		if (count === 0) {
			return 'none';
		}
		return count === this.rows.length ? 'all' : 'some';
	}

	/**
	 * @method toggleGroup
	 * @param {*} key the group key
	 * @public
	 */
	@action
	toggleGroup(key) {
		let groupBy = this.args.groupBy;
		let current = this.collapsed[groupBy] ?? [];
		let next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
		this.collapsed = { ...this.collapsed, [groupBy]: next };
	}

	/**
	 * @method toggleRow
	 * @param {Object} record
	 * @public
	 */
	@action
	toggleRow(record) {
		let id = String(record.id);
		let ids = this.selectedIds.map(String);
		this.select(ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
	}

	/**
	 * Selects every shown item, or clears the selection when all are selected.
	 *
	 * @method toggleAll
	 * @public
	 */
	@action
	toggleAll() {
		this.select(this.selectionState === 'all' ? [] : this.items.map((r) => String(r.id)));
	}

	/**
	 * @method clearSelection
	 * @public
	 */
	@action
	clearSelection() {
		this.select([]);
	}

	/**
	 * Clears the selection when `@items` changes to another page or search.
	 *
	 * @method itemsChanged
	 * @public
	 */
	@action
	itemsChanged() {
		schedule('afterRender', () => {
			if (!this.isDestroying && !this.isDestroyed && this.selectedIds.length) {
				this.select([]);
			}
		});
	}

	/**
	 * @method select
	 * @param {Array} ids
	 * @private
	 */
	select(ids) {
		this.selectedIds = ids;
		this.args.onSelect?.(ids);
	}
}
