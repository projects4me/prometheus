/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Keeps the Task Board's lane-header strip in step with the board below it. The strip itself is stuck under the
 * navbar by CSS (`position: sticky`); this modifier handles what CSS cannot:
 *
 * - sets the strip's `top` from the navbar's height;
 * - translates the header row by the board's horizontal scroll;
 * - copies each lane's width onto its header (ResizeObserver: collapse, peek, window resize);
 * - mirrors the transient `lane-peek` and `lane-droppable` lane classes onto the headers.
 *
 * @example
 *      <div class="lane-header-strip" {{sticky-lane-headers}}>
 *
 * @class StickyLaneHeadersModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class StickyLaneHeadersModifier extends Modifier {
	board = null;
	row = null;
	resizeObserver = null;
	mutationObserver = null;
	frame = null;
	onScroll = null;
	onResize = null;

	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this.teardown());
	}

	modify(element) {
		const board = element.parentElement?.querySelector(':scope > .milestone.box-body');
		if (!board) {
			return;
		}
		if (this.board === board && this.element === element) {
			this.sync();
			return;
		}
		this.teardown();
		this.element = element;
		this.board = board;
		this.row = element.querySelector('.lane-header-row');

		this.onScroll = () => this.syncScroll();
		this.onResize = () => this.schedule();
		board.addEventListener('scroll', this.onScroll, { passive: true });
		window.addEventListener('resize', this.onResize);

		if (typeof ResizeObserver === 'function') {
			this.resizeObserver = new ResizeObserver(() => this.schedule());
			this.resizeObserver.observe(board);
			board.querySelectorAll(':scope > .lane').forEach((lane) => this.resizeObserver.observe(lane));
		}
		if (typeof MutationObserver === 'function') {
			this.mutationObserver = new MutationObserver(() => this.schedule());
			this.mutationObserver.observe(board, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
		}
		this.sync();
	}

	/**
	 * Coalesces the changes of one frame into a single sync.
	 *
	 * @method schedule
	 */
	schedule() {
		if (this.frame !== null) {
			return;
		}
		this.frame = requestAnimationFrame(() => {
			this.frame = null;
			this.sync();
		});
	}

	sync() {
		if (!this.board) {
			return;
		}
		this.syncTop();
		this.syncWidths();
		this.syncScroll();
	}

	/**
	 * Sticks the strip right under the navbar.
	 *
	 * @method syncTop
	 */
	syncTop() {
		const navbar = document.querySelector('.main-header');
		const top = navbar ? Math.round(navbar.getBoundingClientRect().height) : 0;
		this.element.style.top = `${top}px`;
	}

	/**
	 * Copies each lane's width and transient state onto its header.
	 *
	 * @method syncWidths
	 */
	syncWidths() {
		const lanes = Array.from(this.board.querySelectorAll(':scope > .lane'));
		lanes.forEach((lane) => {
			if (this.resizeObserver) {
				this.resizeObserver.observe(lane);
			}
			const head = this.element.querySelector(`[data-lane-head="${CSS.escape(lane.getAttribute('data-lane-name'))}"]`);
			if (!head) {
				return;
			}
			head.style.width = `${lane.getBoundingClientRect().width}px`;
			['lane-peek', 'lane-droppable'].forEach((name) => {
				head.classList.toggle(name, lane.classList.contains(name));
			});
		});
	}

	/**
	 * Moves the header row with the board's horizontal scroll.
	 *
	 * @method syncScroll
	 */
	syncScroll() {
		if (this.row && this.board) {
			this.row.style.transform = this.board.scrollLeft ? `translate3d(${-this.board.scrollLeft}px, 0, 0)` : '';
		}
	}

	teardown() {
		if (this.board && this.onScroll) {
			this.board.removeEventListener('scroll', this.onScroll);
		}
		if (this.onResize) {
			window.removeEventListener('resize', this.onResize);
		}
		this.resizeObserver?.disconnect();
		this.mutationObserver?.disconnect();
		if (this.frame !== null) {
			cancelAnimationFrame(this.frame);
		}
		this.resizeObserver = this.mutationObserver = this.board = this.row = this.onScroll = this.onResize = this.frame = null;
	}
}
