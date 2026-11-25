/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

/**
 * Hands the element it is installed on to a callback, so a component can keep a reference to it.
 *
 * @example
 *      <div {{register-element this.registerTooltipElement}}>
 *
 * @class RegisterElementModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class RegisterElementModifier extends Modifier {
	/**
	 * @method modify
	 * @param {Element} element The element the modifier is installed on
	 * @param {Array} positional The callback to hand the element to
	 */
	modify(element, [callback]) {
		callback?.(element);
	}
}
