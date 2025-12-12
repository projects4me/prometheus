/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import $ from 'jquery';

/**
 * This modifier initializes Bootstrap tooltip on an element.
 * It handles tooltip initialization, updates, and cleanup.
 *
 * @example
 *      <div {{initialize-tooltip @tooltipContent}}>
 *
 * @class InitializeTooltipModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeTooltipModifier extends Modifier {
	/**
	 * The tooltip content to display
	 * @type {String}
	 * @private
	 */
	_tooltipContent = null;

	/**
	 * Whether the tooltip is initialized
	 * @type {Boolean}
	 * @private
	 */
	_isInitialized = false;

	/**
	 * This function is called when the element is rendered in the DOM or when arguments change.
	 * It initializes or updates the Bootstrap tooltip.
	 *
	 * @param {Element} element - The element the modifier is attached to.
	 * @param {Array} positional - The positional arguments passed to the modifier.
	 * @param {Object} named - The named arguments passed to the modifier.
	 */
	modify(
		element,
		[tooltipContent],
		{ placement = 'top', trigger = 'hover', html = true }
	) {
		if (!tooltipContent) {
			this._destroyTooltip(element);
			return;
		}

		if (this._tooltipContent !== tooltipContent) {
			this._tooltipContent = tooltipContent;

			if (element) {
				if (this._isInitialized) {
					this._destroyTooltip(element);
				}

				element.setAttribute('data-toggle', 'tooltip');
				element.setAttribute('data-html', html.toString());
				element.setAttribute('title', tooltipContent);

				$(element).tooltip({
					html: html,
					placement: placement,
					trigger: trigger
				});

				this._isInitialized = true;
			}
		}
	}

	/**
	 * This function is called when the modifier is destroyed.
	 * It cleans up the Bootstrap tooltip.
	 */
	willRemove() {
		if (this.element && this._isInitialized) {
			this._destroyTooltip(this.element);
		}
	}

	/**
	 * Dispose the Bootstrap tooltip
	 *
	 * @method _destroyTooltip
	 * @param {Element} element - The element with the tooltip
	 * @private
	 */
	_destroyTooltip(element) {
		if (element && typeof $ !== 'undefined') {
			try {
				$(element).tooltip('dispose');
				this._isInitialized = false;
			} catch (e) {
				this._isInitialized = false;
			}
		}
	}
}
