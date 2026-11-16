/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

/**
 * Sets the title of the element to its full text, so text cut short with an ellipsis can still be read.
 * Runs again when any argument changes.
 *
 * @class TextAsTitleModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class TextAsTitleModifier extends Modifier {
    /**
     * @method modify
     * @param {HTMLElement} element
     * @public
     */
    modify(element) {
        element.title = element.textContent.trim();
    }
}
