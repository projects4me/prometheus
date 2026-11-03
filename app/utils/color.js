/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * A 6-digit hex colour, e.g. `#80b5d3`, the form Gaia stores colours in.
 *
 * @property HEX_COLOR
 * @type RegExp
 */
export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * The dark (black) label text colour.
 *
 * @property TEXT_DARK
 * @type String
 */
export const TEXT_DARK = '#000000';

/**
 * The light (white) label text colour.
 *
 * @property TEXT_LIGHT
 * @type String
 */
export const TEXT_LIGHT = '#ffffff';

/**
 * Whether the value is a 6-digit hex colour.
 *
 * @method isHexColor
 * @param {String} value
 * @return {Boolean}
 */
export function isHexColor(value) {
    return typeof value === 'string' && HEX_COLOR.test(value);
}

/**
 * The label text colours a status may choose: `dark` (black) or `light` (white).
 *
 * @property TEXT_COLORS
 * @type Object
 */
export const TEXT_COLORS = { dark: TEXT_DARK, light: TEXT_LIGHT };

/**
 * The label text colour of a status saved without one.
 *
 * @property DEFAULT_TEXT_COLOR
 * @type String
 */
export const DEFAULT_TEXT_COLOR = 'light';

/**
 * The text colour of a label: black for `dark`, white for `light` or anything else.
 *
 * @method labelTextColor
 * @param {String} choice `dark` or `light`
 * @return {String} `#000000` or `#ffffff`
 */
export function labelTextColor(choice) {
    return choice === 'dark' ? TEXT_DARK : TEXT_LIGHT;
}

/**
 * The inline style of a label painted with a hex colour: the colour as background and
 * the label's text colour. Empty when the colour is not a hex colour.
 *
 * @method labelStyle
 * @param {String} background A 6-digit hex colour
 * @param {Object} options
 * @param {String} options.textColor `dark` or `light`, light when missing
 * @param {Boolean} options.important Whether the declarations override the stylesheet (`!important`)
 * @return {String}
 */
export function labelStyle(background, { textColor = DEFAULT_TEXT_COLOR, important = false } = {}) {
    if (!isHexColor(background)) {
        return '';
    }

    let flag = important ? ' !important' : '';

    return `background-color: ${background}${flag}; color: ${labelTextColor(textColor)}${flag}`;
}
