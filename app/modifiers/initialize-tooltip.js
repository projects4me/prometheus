/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import $ from 'jquery';
import tippy, { followCursor } from 'tippy.js';

/**
 * This modifier initializes Bootstrap tooltip on an element.
 * It handles tooltip initialization, updates, and cleanup.
 *
 * @example
 *      <div {{initialize-tooltip content="Add issue"}}>
 *      <div {{initialize-tooltip contentElement=this.sharedContentElement}}>  (an Element shared by several hosts)
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
	 * Destroys the tooltip when the modifier is torn down.
	 *
	 * @method constructor
	 * @param {Object} owner
	 * @param {Object} args
	 */
	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this._destroyTooltip());
	}

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
			contentElement = null,
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
				content: contentElement ? '' : content,
				allowHTML: true,
				plugins: [followCursor],
				followCursor: true,
				followCursor: 'horizontal',
				placement: placement,
				theme: theme,
				interactive: interactive,
				// An element shared by several hosts can sit in one tooltip at a time: move it in when this one shows.
				// Tippy re-renders content only when it differs from the last one set, so a host showing the shared
				// element again (after another host took it) would stay empty: clear it first to force the move.
				onShow: (instance) => {
					if (contentElement && !instance.popper.contains(contentElement)) {
						instance.setContent('');
						instance.setContent(contentElement);
					}
				}
			});
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
