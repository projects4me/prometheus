/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

/**
 * Calls the callback once with the element, when the element is inserted
 *
 * @class OnInsertModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class OnInsertModifier extends Modifier {
    /**
     * @property called
     * @type Boolean
     * @private
     */
    called = false;

    /**
     * @method modify
     * @param {HTMLElement} element
     * @param {Array} positional the callback
     * @public
     */
    modify(element, [callback]) {
        if (!this.called) {
            this.called = true;
            callback(element);
        }
    }
}
