/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { GRID_STEP } from 'prometheus/utils/gantt/grid-width';

/**
 * The drag handle between the Gantt issue grid and the timeline. It reports the wanted width (`@onResize`) while dragging with a mouse or pen, and with the Left and Right arrows (16px); `@onResizeEnd` follows when the drag or key press is done; a double click calls `@onReset`.
 *
 * @class AppUiGanttChartGridResizerComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::GanttChart::GridResizer @width={{this.gridWidth}} @min={{240}} @max={{this.gridMax}}
 *   @onResize={{this.setGridWidth}} @onReset={{this.resetGridWidth}} />
 */
export default class AppUiGanttChartGridResizerComponent extends Component {
	@tracked isDragging = false;

	startX = 0;
	startWidth = 0;
	target = null;
	pointerId = null;

	constructor() {
		super(...arguments);
		registerDestructor(this, () => this.stopListening());
	}

	/**
	 * The tip's text while dragging: the width, and "minimum" or "maximum" at a limit
	 *
	 * @property tipLimit
	 * @type String
	 * @public
	 */
	get tipLimit() {
		if (this.args.width <= this.args.min) {
			return 'minimum';
		}
		return this.args.width >= this.args.max ? 'maximum' : '';
	}

	@action
	start(event) {
		if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && event.button !== 0)) {
			return;
		}
		event.preventDefault();
		this.stopListening();
		this.target = event.currentTarget;
		this.pointerId = event.pointerId;
		this.startX = event.clientX;
		this.startWidth = this.args.width;
		try {
			this.target.setPointerCapture?.(event.pointerId);
		} catch {
			// the pointer is gone already
		}
		this.target.addEventListener('pointermove', this.move);
		this.target.addEventListener('pointerup', this.drop);
		this.target.addEventListener('pointercancel', this.drop);
		this.isDragging = true;
	}

	move = (event) => {
		this.args.onResize?.(this.startWidth + event.clientX - this.startX);
	};

	drop = () => {
		this.stopListening();
		this.args.onResizeEnd?.();
	};

	stopListening() {
		if (this.target) {
			this.target.removeEventListener('pointermove', this.move);
			this.target.removeEventListener('pointerup', this.drop);
			this.target.removeEventListener('pointercancel', this.drop);
			try {
				if (this.pointerId !== null) {
					this.target.releasePointerCapture?.(this.pointerId);
				}
			} catch {
				// not captured
			}
		}
		this.target = null;
		this.pointerId = null;
		if (!this.isDestroying && !this.isDestroyed && this.isDragging) {
			this.isDragging = false;
		}
	}

	@action
	keydown(event) {
		let delta = event.key === 'ArrowLeft' ? -GRID_STEP : event.key === 'ArrowRight' ? GRID_STEP : 0;
		if (delta) {
			event.preventDefault();
			this.args.onResize?.(this.args.width + delta);
			this.args.onResizeEnd?.();
		}
	}

	@action
	reset() {
		this.args.onReset?.();
	}
}
