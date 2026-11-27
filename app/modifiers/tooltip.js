/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import tippy from 'tippy.js';

/**
 * The tippy theme that copies the look of the Bootstrap 3 tooltip (styles/components/tooltip.scss).
 */
export const TOOLTIP_THEME = 'p4m';

/**
 * Bootstrap 3 tooltip sizes the theme copies: the widest box, and the distance from the element to
 * the box (the arrow takes the first 5px of it, a 3px gap sits between the arrow and the element).
 */
const MAX_WIDTH = 200;
const DISTANCE = 13;

/**
 * Shows a plain-text tooltip on hover or focus, in the standard dark tooltip look.
 * The text is never read as HTML. An empty text shows no tooltip.
 *
 * @example
 *      <button type="button" {{tooltip (t "views.app.project.list.add")}}>
 *      <span {{tooltip this.label placement="bottom"}}>
 *
 * @class TooltipModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class TooltipModifier extends Modifier {
    /**
     * The tippy instance, null while the text is empty
     * @type {Object}
     * @private
     */
    _instance = null;

    /**
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this._destroy());
    }

    /**
     * Creates the tooltip, or updates its text and placement when they change.
     *
     * @method modify
     * @param {Element} element
     * @param {Array} positional the tooltip text
     * @param {Object} named placement (default top)
     * @public
     */
    modify(element, [text], { placement = 'top' }) {
        const content = text === null || text === undefined ? '' : String(text);

        if (!content) {
            this._destroy();
            return;
        }

        if (this._instance && this._instance.reference !== element) {
            this._destroy();
        }

        if (this._instance) {
            this._instance.setProps({ content, placement });
            return;
        }

        this._instance = tippy(element, {
            content,
            placement,
            allowHTML: false,
            theme: TOOLTIP_THEME,
            maxWidth: MAX_WIDTH,
            offset: [0, DISTANCE],
            duration: 150
        });
    }

    /**
     * @method _destroy
     * @private
     */
    _destroy() {
        if (this._instance) {
            this._instance.destroy();
            this._instance = null;
        }
    }
}
