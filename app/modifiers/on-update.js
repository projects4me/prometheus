/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

/**
 * Calls the callback with the new value each time the value changes, but not on insert.
 *
 * @class OnUpdateModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class OnUpdateModifier extends Modifier {
	/**
	 * @property inserted
	 * @type Boolean
	 * @private
	 */
	inserted = false;

	/**
	 * @property value
	 * @type {*}
	 * @private
	 */
	value;

	/**
	 * @method modify
	 * @param {HTMLElement} element
	 * @param {Array} positional the value to watch and the callback
	 * @public
	 */
	modify(element, [value, callback]) {
		let changed = this.inserted && value !== this.value;
		this.inserted = true;
		this.value = value;
		if (changed) {
		    callback(value);
		}
	}
}
