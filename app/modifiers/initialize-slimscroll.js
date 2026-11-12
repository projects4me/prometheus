/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import $ from 'jquery';

/**
 * This modifier is called on the initialization of div that has overflow on y-axis, to attach
 * slimscroll to that element.
 *
 * @example
 *      <div {{initialize-slimscroll}}>
 *
 * @class InitializeSlimscrollModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeSlimscrollModifier extends Modifier {
	/**
	 * Attaches slimscroll the first time the modifier runs on the element.
	 *
	 * @method modify
	 * @param {Element} element
	 * @param {Array} positional
	 * @param {Object} named
	 * @public
	 */
	modify(element, positional, named) {
		this.element = element;
		this.named = named;
		if (!this._attached) {
			this._attached = true;
			this._attachSlimScroll();
		}
	}
	/**
	 * This function returns the value that will be used to set the width of the scroll bar.
	 *
	 * @method get
	 * @retrun String
	 * @public
	 */
	get width() {
		return this.named.width;
	}

	/**
	 * This function apply slim scroll to element.
	 *
	 * @method _attachSlimScroll
	 * @private
	 */
	_attachSlimScroll() {
		let defaulWidth = 3,
			size;
		size = this.width ?? defaulWidth;

		$(this.element).slimScroll({
			height: this.element.clientHeight,
			allowVisible: false,
			size: size
		});
	}
}
