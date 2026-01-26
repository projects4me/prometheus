/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import $ from 'jquery';
import tippy, { followCursor } from 'tippy.js';

/**
 * This modifier initializes Bootstrap tooltip on an element.
 * It handles tooltip initialization, updates, and cleanup.
 *
 * @example
 *      <div {{initialize-tooltip content="Add issue"}}>
 *
 * @class InitializeTooltipModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeTooltipModifier extends Modifier {
	/**
	 * The tippy tooltip instance
	 * @type {Object}
	 * @private
	 */
	_tooltip = null;

	/**
	 * Triggered when the element is installed or updated on the DOM.
	 *
	 * @method modify
	 * @param {Element} element - The element to initialize the tooltip on
	 * @param {Array} args - The arguments for the modifier
	 * @param {Object} options - The options for the modifier
	 * @public
	 */
	modify(
		element,
		[],
		{
			content = '',
			templateId = null,
			placement = 'top',
			interactive = false,
			theme = 'light'
		}
	) {
		if (element) {
			if (this._tooltip) {
				this._destroyTooltip(element);
			}

			this._tooltip = tippy(element, {
				content: this.getContent(templateId, content),
				allowHTML: true,
				plugins: [followCursor],
				followCursor: true,
				followCursor: 'horizontal',
				placement: placement,
				theme: theme,
				interactive: interactive
			});
		}
	}

	/**
	 * Returns the content for the tooltip based on the template id or the content passed.
	 *
	 * @method getContent
	 * @param {String} templateId - The id of the template to use
	 * @param {String} content - The content to display
	 * @returns {String} The content to display
	 * @public
	 */
	getContent(templateId, content) {
		if (templateId) {
			const template = document.getElementById(`tooltip-${templateId}`);
			return template?.innerHTML;
		} else {
			return content;
		}
	}

	/**
	 * This function is called when the modifier is destroyed.
	 */
	willRemove() {
		if (this._tooltip) {
			this._destroyTooltip();
		}
	}

	/**
	 * Dispose the Bootstrap tooltip
	 *
	 * @method _destroyTooltip
	 * @param {Element} element - The element with the tooltip
	 * @private
	 */
	_destroyTooltip() {
		if (this._tooltip) {
			this._tooltip.destroy();
			this._tooltip = null;
		}
	}
}
