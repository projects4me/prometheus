/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';

/**
 * A component that implements infinite scrolling functionality with optional load more button.
 * This component can be used to load content progressively as the user scrolls down or clicks a load more button.
 *
 * @class InfiniteScrollComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <InfiniteScroll
 *   @onLoadMore={{this.loadMoreItems}}
 *   @threshold={{100}}
 *   @debounceTime={{150}}
 *   @useScrollLoading={{true}}
 *   @useLoadMoreButton={{false}}
 *   @loadingText="Loading more items..."
 *   @endMessageText="No more items to load"
 * >
 *   {{#each this.items as |item|}}
 *     <ItemComponent @item={{item}} />
 *   {{/each}}
 * </InfiniteScroll>
 */
export default class InfiniteScrollComponent extends Component {
	/**
	 * Reference to the scroll container element
	 * @property scrollContainer
	 * @type {HTMLElement}
	 * @private
	 */
	scrollContainer = null;

	/**
	 * Tracks whether content is currently being loaded
	 * @property isLoading
	 * @type {boolean}
	 * @public
	 */
	@tracked isLoading = false;

	/**
	 * Tracks whether all content has been loaded
	 * @property hasReachedEnd
	 * @type {boolean}
	 * @public
	 */
	@tracked hasReachedEnd = false;

	/**
	 * Tracks the current page number
	 * @property page
	 * @type {number}
	 * @public
	 */
	@tracked page = 2;

	/**
	 * Tracks the page size
	 * @property pageSize
	 * @type {number}
	 * @public
	 */
	@tracked pageSize = this.args.pageSize || 5;

	/**
	 * Determines whether to use browser scroll instead of container scroll
	 * @property useBrowserScroll
	 * @type {boolean}
	 * @public
	 */
	get useBrowserScroll() {
		return this.args.useBrowserScroll || false;
	}

	/**
	 * Gets the loading offset for browser scroll mode
	 * @property loadingOffset
	 * @type {number}
	 * @public
	 */
	get loadingOffset() {
		return this.args.loadingOffset || 0;
	}

	/**
	 * Gets the threshold distance from bottom before triggering load more
	 * @property threshold
	 * @type {number}
	 * @public
	 */
	get threshold() {
		return this.args.threshold || 0;
	}

	/**
	 * Gets the debounce time for scroll events
	 * @property debounceTime
	 * @type {number}
	 * @public
	 */
	get debounceTime() {
		return this.args.debounceTime || 150;
	}

	/**
	 * Determines whether to use scroll-based loading
	 * @property useScrollLoading
	 * @type {boolean}
	 * @public
	 */
	get useScrollLoading() {
		if (this.args.useScrollLoading !== undefined) {
			return this.args.useScrollLoading;
		}
		return !this.args.useLoadMoreButton;
	}

	/**
	 * Creates an instance of InfiniteScrollComponent
	 * @constructor
	 */
	constructor() {
		super(...arguments);
		this._boundHandleScroll = this.handleScroll.bind(this);
		this._boundHandleBrowserScroll = this.handleBrowserScroll.bind(this);
	}

	/**
	 * Sets up the scroll listener on the container element
	 * @method setupScrollListener
	 * @param {HTMLElement} element - The container element
	 * @public
	 */
	@action
	setupScrollListener(element) {
		this.scrollContainer = element;

		if (this.useBrowserScroll) {
			// Browser scroll mode
			window.addEventListener('scroll', this._boundHandleBrowserScroll, { passive: true });
		} else if (this.useScrollLoading) {
			// Container scroll mode (existing logic)
			this.scrollContainer.addEventListener(
				'scroll',
				this._boundHandleScroll
			);
		}
	}

	/**
	 * Removes the scroll listener from the container element
	 * @method teardownScrollListener
	 * @public
	 */
	@action
	teardownScrollListener() {
		if (this.useBrowserScroll) {
			window.removeEventListener('scroll', this._boundHandleBrowserScroll);
		} else if (this.scrollContainer && this.useScrollLoading) {
			this.scrollContainer.removeEventListener(
				'scroll',
				this._boundHandleScroll
			);
		}
	}

	/**
	 * Handles scroll events with debouncing
	 * @method handleScroll
	 * @param {Event} event - The scroll event
	 * @public
	 */
	@action
	handleScroll(event) {
		debounce(this, this.checkScrollPosition, event, this.debounceTime);
	}

	/**
	 * Handles browser scroll events with debouncing
	 * @method handleBrowserScroll
	 * @param {Event} event - The scroll event
	 * @public
	 */
	@action
	handleBrowserScroll(event) {
		debounce(this, this.checkBrowserScrollPosition, event, this.debounceTime);
	}

	/**
	 * Checks if scroll position has reached threshold to load more content
	 * @method checkScrollPosition
	 * @param {Event} event - The scroll event
	 * @private
	 */
	checkScrollPosition(event) {
		if ((this.isLoading || this.hasReachedEnd) && !this.args.loadMore) return;

		const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
		const scrollRemaining = scrollHeight - scrollTop - clientHeight;

		if (scrollRemaining <= this.threshold) {
			this.loadMore(event);
		}
	}

	/**
	 * Checks if browser scroll position has reached threshold to load more content
	 * @method checkBrowserScrollPosition
	 * @param {Event} event - The scroll event
	 * @private
	 */
	checkBrowserScrollPosition(event) {
		if ((this.isLoading || this.hasReachedEnd) && !this.args.loadMore) return;

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		const scrollRemaining = documentHeight - scrollTop - windowHeight;

		if (scrollRemaining <= this.threshold) {
			this.loadMore(event);
		}
	}

	/**
	 * Resets pagination state
	 * @method resetPagination
	 * @public
	 */
	@action
	resetPagination() {
		this.page = 1;
		this.hasReachedEnd = false;
	}

	/**
	 * Loads more content using the provided callback
	 * @method loadMore
	 * @param {Event} event - The load more event
	 * @public
	 */
	@action
	async loadMore(event) {
		if ((this.isLoading || this.hasReachedEnd) && !this.args.loadMore) return;
		
		const loadMoreBtnClicked = event.type !== 'scroll';
		
		try {
			this.isLoading = true;
			
			// Call the provided loadMore function with current page info
			const result = await this.args.onLoadMore({
				page: this.page,
				pageSize: this.pageSize,
				loadMoreClicked: loadMoreBtnClicked
			});

			// Handle the result
			if (result && result.items) {

				// Check if we've reached the end
				if (result.items.length < this.pageSize || result.hasReachedEnd) {
					this.hasReachedEnd = true;
				} else {
					this.page++;
				}
			}
		} catch (error) {
			console.error('Failed to load more items', error);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Initializes slimscroll on the container element
	 * @method initializeSlimScroll
	 * @param {HTMLElement} e - The container element
	 * @public
	 */
	@action
	initializeSlimScroll(e) {
		$(e).slimscroll({
			height: e.clientHeight,
			allowVisible: false,
			size: 5
		});
	}

	/**
	 * Cleanup when component is destroyed
	 * @method willDestroy
	 * @public
	 */
	willDestroy() {
		super.willDestroy();
		this.teardownScrollListener();
	}
}
