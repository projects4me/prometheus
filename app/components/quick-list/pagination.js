/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Range text and previous/next buttons for a QuickList.
 *
 * @class QuickListPaginationComponent
 * @namespace Prometheus.Components
 * @extends Component
 *
 * Without `@total` (Gaia sends none) pass `@hasNext` and `@count` (the rows shown): the range reads
 * `1-20 / 20+` while a next page exists and `21-25 / 25` on the last page, and the buttons follow
 * `@hasNext`. The component hides on page 1 without a next page.
 *
 * @example
 * <QuickList::Pagination @page={{1}} @limit={{20}} @count={{20}} @hasNext={{true}} @onPage={{this.setPage}} />
 * <QuickList::Pagination @page={{1}} @limit={{20}} @total={{64}} @disabled={{false}} @onPage={{this.setPage}} />
 */
export default class QuickListPaginationComponent extends Component {
	get page() {
		return Math.max(1, Number(this.args.page) || 1);
	}

	get limit() {
		return Math.max(1, Number(this.args.limit) || 1);
	}

	get hasTotal() {
		return this.args.total !== undefined && this.args.total !== null;
	}

	get total() {
		return Math.max(0, Number(this.args.total) || 0);
	}

	get lastPage() {
		return Math.max(1, Math.ceil(this.total / this.limit));
	}

	get hasNext() {
		return this.hasTotal ? this.page < this.lastPage : Boolean(this.args.hasNext);
	}

	get hasPages() {
		return this.hasTotal ? this.total > this.limit : this.page > 1 || Boolean(this.args.hasNext);
	}

	get from() {
		return (this.page - 1) * this.limit + 1;
	}

	get to() {
		if (this.hasTotal) {
			return Math.min(this.page * this.limit, this.total);
		}
		return this.args.hasNext ? this.page * this.limit : (this.page - 1) * this.limit + (Number(this.args.count) || 0);
	}

	/**
	 * The total of the range text: the total, or without one the last row shown, followed by `+` while a
	 * next page exists.
	 */
	get totalText() {
		if (this.hasTotal) {
			return this.total;
		}
		return this.args.hasNext ? `${this.to}+` : String(this.to);
	}

	get isPreviousDisabled() {
		return Boolean(this.args.disabled) || this.page <= 1;
	}

	get isNextDisabled() {
		return Boolean(this.args.disabled) || !this.hasNext;
	}

	@action
	previous() {
		if (!this.isPreviousDisabled) {
			this.args.onPage?.(this.page - 1);
		}
	}

	@action
	next() {
		if (!this.isNextDisabled) {
			this.args.onPage?.(this.page + 1);
		}
	}
}
