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
 * @example
 * <QuickList::Pagination @page={{1}} @limit={{20}} @total={{64}} @disabled={{false}} @onPage={{this.setPage}} />
 */
export default class QuickListPaginationComponent extends Component {
	get page() {
		return Math.max(1, Number(this.args.page) || 1);
	}

	get limit() {
		return Math.max(1, Number(this.args.limit) || 1);
	}

	get total() {
		return Math.max(0, Number(this.args.total) || 0);
	}

	get lastPage() {
		return Math.max(1, Math.ceil(this.total / this.limit));
	}

	get hasPages() {
		return this.total > this.limit;
	}

	get from() {
		return (this.page - 1) * this.limit + 1;
	}

	get to() {
		return Math.min(this.page * this.limit, this.total);
	}

	get isPreviousDisabled() {
		return Boolean(this.args.disabled) || this.page <= 1;
	}

	get isNextDisabled() {
		return Boolean(this.args.disabled) || this.page >= this.lastPage;
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
