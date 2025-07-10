/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';

/**
 * A self-contained, reusable pagination component for Ember.js.
 * Handles page navigation, loading state, and disables navigation buttons as appropriate.
 * Parent must provide @onPageChange callback, which should return an object: { items, hasMore }.
 *
 * @class PaginationComponent
 * @namespace Prometheus.Components
 * @module Pagination
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <Pagination
 *   @pageSize={{10}}
 *   @onPageChange={{this.handlePageChange}}
 *   @showPageInfo={{true}}
 *   @initialLoad={{true}}
 *   @reverseNavigation={{true}}
 *   @previousButtonTitle="views.customPreviousButtonTitle"
 *   @nextButtonTitle="views.customNextButtonTitle"
 * />
 */
export default class PaginationComponent extends Component {
	/**
	 * The current page number.
	 * @property page
	 * @type {number}
	 * @public
	 */
	@tracked page = 1;

	/**
	 * The number of items per page.
	 * @property pageSize
	 * @type {number}
	 * @public
	 */
	@tracked pageSize = this.args.pageSize || 10;

	/**
	 * Whether the pagination is currently loading data.
	 * @property isLoading
	 * @type {boolean}
	 * @public
	 */
	@tracked isLoading = false;

	/**
	 * Whether there are more pages available after the current one.
	 * @property hasMore
	 * @type {boolean}
	 * @public
	 */
	@tracked hasMore = true; // Assume there are more pages until told otherwise

	/**
	 * Whether to reverse the navigation direction.
	 * When true: Previous button loads newer data, Next button loads older data
	 * When false: Previous button loads older data, Next button loads newer data
	 * @property reverseNavigation
	 * @type {boolean}
	 * @public
	 */
	get reverseNavigation() {
		return this.args.reverseNavigation === true;
	}

	/**
	 * Determines whether the previous button should be disabled.
	 * @property isPreviousDisabled
	 * @type {boolean}
	 * @public
	 */
	get isPreviousDisabled() {
		if (this.reverseNavigation) {
			return this.isLoading;
		}
		return this.page <= 1 || this.isLoading;
	}

	/**
	 * Determines whether the next button should be disabled.
	 * @property isNextDisabled
	 * @type {boolean}
	 * @public
	 */
	get isNextDisabled() {
		if (this.reverseNavigation) {
			return this.page <= 1 || this.isLoading;
		}
		return !this.hasMore || this.isLoading;
	}

	/**
	 * Gets the center text to display in the pagination footer.
	 * @property centerText
	 * @type {string}
	 * @public
	 */
	get centerText() {
		return `Page ${this.page}`;
	}

	/**
	 * Determines whether to show page information.
	 * @property showPageInfo
	 * @type {boolean}
	 * @public
	 */
	get showPageInfo() {
		return this.args.showPageInfo !== false;
	}

	/**
	 * Initializes the component and triggers the initial page load if requested.
	 * @method constructor
	 * @public
	 */
	constructor() {
		super(...arguments);
		// Initial load
		if (this.args.initialLoad) {
			this.loadPage(1);
		}
	}

	/**
	 * Changes to a specific page and triggers the parent's onPageChange callback.
	 * Updates loading state and hasMore flag based on the callback's result.
	 *
	 * @method loadPage
	 * @param {number} page - The page number to navigate to
	 * @private
	 * @returns {Promise<void>}
	 */
	async loadPage(page) {
		if (this.isLoading) return;
		next(this, function () {
			this.isLoading = true;
		});
		try {
			const result = await this.args.onPageChange({
				page,
				pageSize: this.pageSize,
				previousPage: this.page
			});
			this.page = page;
			// Parent callback should return { items, hasMore }
			if (result && typeof result.hasMore !== 'undefined') {
				this.hasMore = result.hasMore;
			} else {
				// Fallback: if no hasMore, always enable next
				this.hasMore = true;
			}
		} catch (e) {
			// Optionally handle error
		} finally {
			next(this, function () {
				this.isLoading = false;
			});
		}
	}

	/**
	 * Navigates to the previous page, if not disabled.
	 * In reverse mode, this loads newer data.
	 * In normal mode, this loads older data.
	 *
	 * @method goToPreviousPage
	 * @public
	 * @action
	 * @returns {Promise<void>}
	 */
	@action
	async goToPreviousPage() {
		if (this.isPreviousDisabled) return;
		await this.loadPage(this.page + (this.reverseNavigation ? 1 : -1));
	}

	/**
	 * Navigates to the next page, if not disabled.
	 * In reverse mode, this loads older data.
	 * In normal mode, this loads newer data.
	 *
	 * @method goToNextPage
	 * @public
	 * @action
	 * @returns {Promise<void>}
	 */
	@action
	async goToNextPage() {
		if (this.isNextDisabled) return;
		await this.loadPage(this.page + (this.reverseNavigation ? -1 : 1));
	}

	/**
	 * Resets pagination to the first page.
	 *
	 * @method resetPagination
	 * @public
	 * @action
	 */
	@action
	resetPagination() {
		this.loadPage(1);
	}
}
