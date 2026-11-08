/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The header of a `QuickList`: the box title with the record count, and the header tools.
 *
 * Arguments:
 * - `@title` {String}: the box title, already translated.
 * - `@count` {Number}: the number of records shown.
 * - `@showCount` {Boolean}: whether to show the count (the list hides it while loading or after an
 *   error). Defaults to true; the count is also hidden when `@count` is not a number.
 * - `@total` {Number}: optional total number of matching records. When it differs from `@count`, the
 *   header reads `count of total` (for example `0 of 64`); otherwise it shows `@count` alone.
 * - `@hasNext` {Boolean}: without a `@total`, a next page exists, so the count reads `20+`.
 *
 * Block: the default block is rendered inside the header's `box-tools` (the list's `<:actions>`).
 *
 * @class QuickListHeaderComponent
 * @extends Component
 * @author Agent Odysseus
 *
 * @example
 * <QuickList::Header @title="Ideas" @count={{0}} @total={{64}}>
 *   <button type="button" class="btn btn-box-tool"><i class="fa fa-plus"></i></button>
 * </QuickList::Header>
 */
export default class QuickListHeaderComponent extends Component {
	/**
	 * Whether a count was passed and should be shown.
	 *
	 * @property hasCount
	 * @type {Boolean}
	 * @public
	 */
	get hasCount() {
		return this.args.showCount !== false && typeof this.args.count === 'number';
	}

	/**
	 * Whether the header shows `count of total` instead of the count alone.
	 *
	 * @property showTotal
	 * @type {Boolean}
	 * @public
	 */
	get showTotal() {
		let total = this.args.total;
		return typeof total === 'number' && total !== this.args.count;
	}

	/**
	 * Whether the count reads `count+`: more records exist than the shown page and no total is known.
	 *
	 * @property showMore
	 * @type {Boolean}
	 * @public
	 */
	get showMore() {
		let total = this.args.total;
		return (total === undefined || total === null) && Boolean(this.args.hasNext);
	}
}
