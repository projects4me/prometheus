/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The longest status value Gaia accepts.
 *
 * @property STATUS_VALUE_MAX_LENGTH
 * @type Number
 * @public
 */
export const STATUS_VALUE_MAX_LENGTH = 30;

/**
 * Turns text into an issue status value, the form Gaia accepts (`^[a-z0-9_]+$`, at most
 * 30 characters): lowercase, spaces become `_` and every other character is removed,
 * e.g. `In Review 2!` → `in_review_2`.
 *
 * @method toStatusValue
 * @param {String} text
 * @return {String}
 * @public
 */
export function toStatusValue(text) {
    return String(text ?? '')
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, STATUS_VALUE_MAX_LENGTH);
}
