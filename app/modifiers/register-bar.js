/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor, isDestroying } from '@ember/destroyable';

/**
 * Registers the element it is installed on as an issue's bar while it is rendered, and unregisters it when it is
 * removed, so the Gantt's dependency lines can find it.
 *
 * @example
 *      <div {{register-bar issue.id this.registerBar this.unregisterBar}}>
 *
 * @class RegisterBarModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class RegisterBarModifier extends Modifier {
	issueId = null;
	unregister = null;

	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this.unregister?.(this.issueId));
	}

	/**
	 * @method modify
	 * @param {Element} element The bar element
	 * @param {Array} positional The issue id, the register callback and the unregister callback
	 */
	modify(element, [issueId, register, unregister]) {
		this.issueId = issueId;
		this.unregister = unregister;
		// after the render transaction: registering bumps the chart's tracked bar version, which rendering has already read
		Promise.resolve().then(() => {
			if (!isDestroying(this)) {
				register?.(issueId, element);
			}
		});
	}
}
