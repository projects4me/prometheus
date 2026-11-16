/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

const VARIANTS = ['default', 'primary', 'info', 'success', 'warning', 'danger'];
const PALETTE = ['primary', 'info', 'success', 'warning', 'danger'];

/**
 * A tag in the Task Board look: border and text in the variant colour on a tint of it. The variant is given, or
 * picked from the palette by a hash of @colorKey so the same text always gets the same colour. With @onRemove it
 * shows a remove button. The text element carries its full text as the title, for text cut short by the maximum width.
 *
 * @class AppUiTagComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiTagComponent extends Component {
    /**
     * The colour variant: @variant when valid, else the palette colour of @colorKey, else default.
     *
     * @property variant
     * @type String
     */
    get variant() {
        const { variant, colorKey } = this.args;
        if (VARIANTS.includes(variant)) {
            return variant;
        }
        if (!variant && colorKey) {
            return PALETTE[hash(String(colorKey)) % PALETTE.length];
        }
        return 'default';
    }

    /**
     * Calls @onRemove.
     *
     * @method remove
     * @param {Event} event The click
     */
    @action
    remove(event) {
        event.stopPropagation();
        this.args.onRemove?.();
    }
}

/**
 * A simple, stable string hash.
 *
 * @method hash
 * @param {String} text
 * @return {Number} A non-negative integer
 */
function hash(text) {
    let value = 0;
    for (let i = 0; i < text.length; i++) {
        value = (value * 31 + text.charCodeAt(i)) >>> 0;
    }
    return value;
}
