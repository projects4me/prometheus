/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { delegate } from 'tippy.js';

/**
 * The selector of the elements that get a tooltip.
 */
export const TOOLTIP_SELECTOR = '[data-toggle="tooltip"]';

/**
 * Reads the tooltip text of an element from its title attribute. The title is
 * moved to data-original-title so the browser does not show its own tooltip too.
 *
 * @method tooltipContent
 * @param {Element} element
 * @return {String}
 */
function tooltipContent(element) {
    const title = element.getAttribute('title');
    if (title) {
        element.setAttribute('data-original-title', title);
        element.removeAttribute('title');
    }
    return element.getAttribute('data-original-title') || '';
}

/**
 * Registers one delegated tooltip handler on the given root, so that elements
 * rendered later also get their tooltip. Does not use jQuery.
 *
 * @method registerDelegatedTooltips
 * @param {Element} root
 * @return {Array} the tippy instances
 */
export function registerDelegatedTooltips(root = document.body) {
    return delegate(root, {
        target: TOOLTIP_SELECTOR,
        content: tooltipContent,
        placement: 'top'
    });
}
