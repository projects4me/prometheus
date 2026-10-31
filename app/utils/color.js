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
 * The text colour on light backgrounds.
 *
 * @property TEXT_DARK
 * @type String
 */
export const TEXT_DARK = '#000000';

/**
 * The text colour on dark backgrounds.
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
 * The relative luminance of a hex colour, 0 (black) to 1 (white), as defined by WCAG 2.
 *
 * @method luminance
 * @param {String} hex A 6-digit hex colour
 * @return {Number}
 */
export function luminance(hex) {
    let [r, g, b] = [1, 3, 5].map((start) => {
        let channel = parseInt(hex.slice(start, start + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The label text colours a status may choose; any other choice means automatic.
 *
 * @property TEXT_COLORS
 * @type Object
 */
export const TEXT_COLORS = { dark: TEXT_DARK, light: TEXT_LIGHT };

/**
 * The text colour readable on the given background: black on light colours, white on
 * dark ones, whichever has the higher contrast. Null when the background is not a hex colour.
 *
 * @method readableTextColor
 * @param {String} background A 6-digit hex colour
 * @return {String} `#000000`, `#ffffff` or null
 */
export function readableTextColor(background) {
    if (!isHexColor(background)) {
        return null;
    }

    // Black and white give the same contrast ratio (about 4.58:1) at a luminance of about 0.179.
    return luminance(background) > 0.179 ? TEXT_DARK : TEXT_LIGHT;
}

/**
 * The text colour of a label: the chosen one (`dark` or `light`), else the one readable
 * on the background. Null when the background is not a hex colour.
 *
 * @method labelTextColor
 * @param {String} background A 6-digit hex colour
 * @param {String} choice `dark`, `light`, or null for automatic
 * @return {String} `#000000`, `#ffffff` or null
 */
export function labelTextColor(background, choice = null) {
    if (!isHexColor(background)) {
        return null;
    }

    let chosen = Object.prototype.hasOwnProperty.call(TEXT_COLORS, choice) ? TEXT_COLORS[choice] : null;

    return chosen ?? readableTextColor(background);
}

/**
 * The inline style of a label painted with a hex colour: the colour as background and
 * the label's text colour. Empty when the colour is not a hex colour.
 *
 * @method labelStyle
 * @param {String} background A 6-digit hex colour
 * @param {Object} options
 * @param {String} options.textColor `dark`, `light`, or null to pick it from the background
 * @param {Boolean} options.important Whether the declarations override the stylesheet (`!important`)
 * @return {String}
 */
export function labelStyle(background, { textColor = null, important = false } = {}) {
    if (!isHexColor(background)) {
        return '';
    }

    let flag = important ? ' !important' : '';

    return `background-color: ${background}${flag}; color: ${labelTextColor(background, textColor)}${flag}`;
}
