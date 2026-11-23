/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * This modifier implements sticky status-header behaviour for the Task Board.
 *
 * Because the lane headers live inside `.milestone.box-body` (overflow-x: auto),
 * CSS `position: sticky` cannot be used relative to the window — the overflow
 * container becomes the sticky scroll context instead.
 *
 * The approach taken here keeps the headers exactly where they are in the DOM
 * (so horizontal scroll always moves them naturally with the lanes).
 *
 * @example
 *      <div class="milestone box" {{sticky-board-headers}}>
 *
 * @class StickyBoardHeadersModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class StickyBoardHeadersModifier extends Modifier {
	/**
	 * Bound reference to the window scroll handler so it can be removed on
	 * destroy.
	 *
	 * @property _scrollHandler
	 * @type Function|null
	 * @private
	 */
	_scrollHandler = null;

	/**
	 * Pending animation frame id, so scroll events are coalesced to one update per frame.
	 *
	 * @property _frame
	 * @type Number|null
	 * @private
	 */
	_frame = null;

	/**
	 * Translate currently applied to the headers, to avoid redundant style writes.
	 *
	 * @property _applied
	 * @type Number
	 * @private
	 */
	_applied = 0;

	/**
	 * Removes the scroll listener when the modifier is torn down.
	 *
	 * @method constructor
	 * @param {Object} owner
	 * @param {Object} args
	 */
	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this._teardown());
	}

	/**
	 * Called when the modifier is first installed.
	 * Attaches a passive window scroll listener.
	 *
	 * @method modify
	 * @param {Element} element
	 * @public
	 */
	modify(element) {
		this.element = element;
		if (this._scrollHandler) {
			return;
		}
		this._scrollHandler = () => {
			if (this._frame === null) {
				this._frame = requestAnimationFrame(() => {
					this._frame = null;
					this._handleScroll();
				});
			}
		};
		window.addEventListener('scroll', this._scrollHandler, { passive: true });
	}

	/**
	 * Called when the modifier is removed from the element.
	 * Removes the scroll listener and resets any active transforms.
	 *
	 * @method _teardown
	 * @private
	 */
	_teardown() {
		if (this._scrollHandler) {
			window.removeEventListener('scroll', this._scrollHandler);
		}
		if (this._frame !== null) {
			cancelAnimationFrame(this._frame);
			this._frame = null;
		}
		this._resetHeaders();
	}

	/**
	 * Returns all lane `.box-header` elements inside this milestone board.
	 * Re-queried on every scroll tick so that newly rendered statuses are
	 * always included.
	 *
	 * @method _getHeaders
	 * @return {HTMLElement[]}
	 * @private
	 */
	_getHeaders() {
		return Array.from(
			this.element.querySelectorAll('.milestone.box-body .lane .box-header')
		);
	}

	/**
	 * Core scroll handler.
	 *
	 * Calculates how far the board body has scrolled above the navbar and
	 * applies an equivalent `translateY` to each lane header so they remain
	 * visible.  The offset is clamped so headers never travel past the
	 * bottom of the board container.
	 *
	 * @method _handleScroll
	 * @private
	 */
	_handleScroll() {
		const boardBody = this.element.querySelector('.milestone.box-body');
		const headers = this._getHeaders();
		if (!boardBody || !headers.length) return;

		// Read the navbar's real bottom edge each frame so a changed or late-rendered navbar can't leave a gap.
		const navbar = document.querySelector('.main-header');
		const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
		const boardRect = boardBody.getBoundingClientRect();
		const headerHeight = headers[0].offsetHeight;
		// Where the header sits without any transform (its current position minus what we applied).
		const naturalTop = headers[0].getBoundingClientRect().top - this._applied;
		const offset = navBottom - naturalTop;
		// Never float beyond the board's lower boundary.
		const maxOffset = boardRect.bottom - naturalTop - headerHeight;
		const next = offset > 0 ? Math.max(0, Math.min(offset, maxOffset)) : 0;

		if (next === this._applied) return;
		this._applied = next;
		const value = next ? `translate3d(0, ${next}px, 0)` : '';
		headers.forEach((header) => {
			header.style.transform = value;
		});
	}

	/**
	 * Removes all inline transforms previously applied to lane headers.
	 *
	 * @method _resetHeaders
	 * @private
	 */
	_resetHeaders() {
		this._applied = 0;
		this._getHeaders().forEach((header) => {
			header.style.transform = '';
		});
	}
}
