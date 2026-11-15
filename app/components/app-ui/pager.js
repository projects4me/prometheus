/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * The range text and the previous/next buttons of a paged list. It only shows where the list is and reports
 * a page change; the caller owns the query.
 *
 * Gaia sends no totals, so the pager works from `@offset`, `@limit`, `@count` (the rows shown) and `@hasMore`:
 * the range reads `1-20 / 20+` while more rows exist and `21-25 / 25` on the last page. With `@total` the
 * range reads `1-20 / 64` and › follows the total.
 *
 * @class AppUiPagerComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::Pager @offset={{0}} @limit={{20}} @count={{20}} @hasMore={{true}} @onPageChange={{this.goTo}} />
 */
export default class AppUiPagerComponent extends Component {
	/**
	 * The page size, at least 1.
	 *
	 * @property limit
	 * @type Number
	 */
	get limit() {
		return Math.max(1, Number(this.args.limit) || 1);
	}

	/**
	 * The offset of the first row shown, never negative.
	 *
	 * @property offset
	 * @type Number
	 */
	get offset() {
		return Math.max(0, Number(this.args.offset) || 0);
	}

	/**
	 * Whether the caller passed a record count.
	 *
	 * @property hasTotal
	 * @type Boolean
	 */
	get hasTotal() {
		return this.args.total !== undefined && this.args.total !== null;
	}

	/**
	 * Whether rows exist after this page.
	 *
	 * @property hasMore
	 * @type Boolean
	 */
	get hasMore() {
		return this.hasTotal ? this.offset + this.limit < Number(this.args.total) : Boolean(this.args.hasMore);
	}

	/**
	 * The number of the first row shown; never past the last row when a total is known.
	 *
	 * @property from
	 * @type Number
	 */
	get from() {
		return this.hasTotal ? Math.min(this.offset + 1, this.to) : this.offset + 1;
	}

	/**
	 * The number of the last row shown; a full page while more rows exist.
	 *
	 * @property to
	 * @type Number
	 */
	get to() {
		if (this.hasTotal) {
			return Math.min(this.offset + this.limit, Math.max(0, Number(this.args.total) || 0));
		}
		return this.args.hasMore ? this.offset + this.limit : this.offset + (Number(this.args.count) || 0);
	}

	/**
	 * The total of the range text: the total, or without one the last row shown, followed by `+` while more
	 * rows exist.
	 *
	 * @property totalText
	 * @type String
	 */
	get totalText() {
		if (this.hasTotal) {
			return String(Math.max(0, Number(this.args.total) || 0));
		}
		return this.hasMore ? `${this.to}+` : String(this.to);
	}

	/**
	 * @property isPreviousDisabled
	 * @type Boolean
	 */
	get isPreviousDisabled() {
		return Boolean(this.args.disabled) || this.offset <= 0;
	}

	/**
	 * @property isNextDisabled
	 * @type Boolean
	 */
	get isNextDisabled() {
		return Boolean(this.args.disabled) || !this.hasMore;
	}

	/**
	 * Reports the offset of the previous page.
	 *
	 * @method previous
	 */
	@action
	previous() {
		if (!this.isPreviousDisabled) {
			this.args.onPageChange?.(Math.max(0, this.offset - this.limit));
		}
	}

	/**
	 * Reports the offset of the next page.
	 *
	 * @method next
	 */
	@action
	next() {
		if (!this.isNextDisabled) {
			this.args.onPageChange?.(this.offset + this.limit);
		}
	}
}
