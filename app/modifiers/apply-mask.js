/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';

/**
 * The characters each mask type allows, one character at a time
 *
 * @property MASKS
 * @type {Object}
 * @private
 */
const MASKS = {
    alpha: /[a-zA-Z\s]/,
    alphanumeric: /[a-zA-Z0-9\s]/,
    email: /[\w@\-.+]/,
};

/**
 * Keeps only the characters the pattern allows
 *
 * @method filterValue
 * @param {String} value
 * @param {RegExp} pattern
 * @return {String}
 * @private
 */
function filterValue(value, pattern) {
    return Array.from(value)
        .filter((char) => pattern.test(char))
        .join('');
}

/**
 * Removes the disallowed characters from the element, keeps the caret next to the
 * characters it was after, and fires an input event when the value changed so
 * that the value binding follows.
 *
 * @method applyFilter
 * @param {HTMLInputElement} element
 * @param {RegExp} pattern
 * @private
 */
function applyFilter(element, pattern) {
    const value = element.value ?? '';
    const filtered = filterValue(value, pattern);
    if (filtered === value) {
        return;
    }

    let caret = null;
    try {
        if (document.activeElement === element && element.selectionStart !== null) {
            caret = filterValue(value.slice(0, element.selectionStart), pattern).length;
        }
    } catch {
        // input types without selection support
    }

    element.value = filtered;
    if (caret !== null) {
        element.setSelectionRange(caret, caret);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * This modifier will be called on the creation of input field to apply masking on it
 * (typed and pasted characters not allowed by the mask type are dropped)
 *
 * @namespace Prometheus.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default modifier((element, [maskType]) => {
    const pattern = MASKS[maskType];
    if (pattern === undefined) {
        return;
    }

    const onInput = () => applyFilter(element, pattern);
    applyFilter(element, pattern);
    element.addEventListener('input', onInput);

    return () => {
        element.removeEventListener('input', onInput);
    };
});
