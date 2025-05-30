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

		if (this.useScrollLoading) {
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
		if (this.scrollContainer && this.useScrollLoading) {
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
	 * Checks if scroll position has reached threshold to load more content
	 * @method checkScrollPosition
	 * @param {Event} event - The scroll event
	 * @private
	 */
	checkScrollPosition(event) {
		if (this.isLoading || this.hasReachedEnd) return;

		const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
		const scrollRemaining = scrollHeight - scrollTop - clientHeight;

		if (scrollRemaining <= this.threshold) {
			this.loadMore(event);
		}
	}

	/**
	 * Loads more content using the provided callback
	 * @method loadMore
	 * @param {Event} event - The load more event
	 * @public
	 */
	@action
	async loadMore(event) {
		if (this.isLoading) return;
		const loadMoreBtnClicked = event.type !== 'scroll';
		try {
			this.isLoading = true;
			await this.args.onLoadMore(false, {
				loadMoreClicked: loadMoreBtnClicked
			});
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
