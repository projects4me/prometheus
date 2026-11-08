/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

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
	 * The items paired with whether each one is the open record (`@activeId`). Ids are compared as
	 * strings, so a numeric `@activeId` matches an Ember Data id.
	 *
	 * @property rows
	 * @type {Array} of `{ record, isActive }`
	 * @public
	 */
	get rows() {
		let activeId = this.args.activeId;
		let hasActive = activeId !== undefined && activeId !== null;
		return this.items.map((record) => ({
			record,
			isActive: hasActive && !!record && String(record.id) === String(activeId),
		}));
	}
}
