/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

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
	 * Height of the AdminLTE fixed navbar.  The sticky headers must clear
	 * this so they do not slide under the navbar when floating.
	 *
	 * @property _navbarHeight
	 * @type Number
	 * @private
	 */
	_navbarHeight = 50;

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
	 * Called when the modifier is first installed.
	 * Resolves the navbar height dynamically (falls back to 50 px) and
	 * attaches a passive window scroll listener.
	 *
	 * @method didInstall
	 * @public
	 */
	didInstall() {
		const navbar = document.querySelector('.main-header');
		if (navbar) {
			this._navbarHeight = navbar.offsetHeight;
		}

		this._scrollHandler = this._handleScroll.bind(this);
		window.addEventListener('scroll', this._scrollHandler, { passive: true });
	}

	/**
	 * Called when the modifier is removed from the element.
	 * Removes the scroll listener and resets any active transforms.
	 *
	 * @method willDestroy
	 * @public
	 */
	willDestroy() {
		if (this._scrollHandler) {
			window.removeEventListener('scroll', this._scrollHandler);
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
		if (!boardBody) return;

		const boardRect = boardBody.getBoundingClientRect();
		const offset = this._navbarHeight - boardRect.top;

		if (offset > 0) {
			const headers = this._getHeaders();
			const headerHeight = headers.length ? headers[0].offsetHeight : 64;
			// Clamp so the header never floats beyond the board's lower boundary
			const maxOffset = boardRect.height - headerHeight;
			const clampedOffset = Math.min(offset, maxOffset);

			headers.forEach((header) => {
				header.style.transform = `translateY(${clampedOffset}px)`;
			});
		} else {
			this._resetHeaders();
		}
	}

	/**
	 * Removes all inline transforms previously applied to lane headers.
	 *
	 * @method _resetHeaders
	 * @private
	 */
	_resetHeaders() {
		this._getHeaders().forEach((header) => {
			header.style.transform = '';
		});
	}
}
