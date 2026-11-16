/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The generated look of an avatar without an image: the initials of a name and a stable colour/pattern identity
 * derived from a key (the user id, or the name). Nothing is stored; the same key always gives the same result.
 *
 * IMPORTANT: the order of COLORS and PATTERNS must never change. The identity is an index into them, so
 * reordering (or inserting into) a list changes the avatar of every user. Append only, and mirror any change in
 * app/styles/components/app-ui-avatar.scss.
 */

// Dark palette colours that keep white text readable. Mirrors app/styles/variables.scss:
// $primaryColor, $highlightColor, $secondaryColor, $dangerColor, $warningColor, $darkColor.
export const COLORS = ['#B3244F', '#640C44', '#1B7BBA', '#D33724', '#DB8B0B', '#333333'];

// half-bottom, half-left, corner circle top-right, corner circle bottom-left, ring.
export const PATTERNS = ['half-bottom', 'half-left', 'corner-top-right', 'corner-bottom-left', 'ring'];

/**
 * The initials of a name: the first letter of the first and of the last word, uppercase. One word gives one
 * letter, and size xs always gives one letter. An empty name gives null.
 *
 * @method initials
 * @param {String} name
 * @param {String} size
 * @return {String|null}
 */
export function initials(name, size) {
    let words = String(name ?? '').trim().split(/\s+/).filter(Boolean);

    if (!words.length) {
        return null;
    }

    let first = (word) => Array.from(word)[0].toLocaleUpperCase();
    let letters = first(words[0]);

    if (words.length > 1 && size !== 'xs') {
        letters += first(words[words.length - 1]);
    }

    return letters;
}

/**
 * 32-bit FNV-1a hash of a string.
 *
 * @method hash
 * @param {String} text
 * @return {Number}
 */
export function hash(text) {
    let h = 0x811c9dc5;

    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }

    return h >>> 0;
}

/**
 * The stable identity of a key as indexes into COLORS and PATTERNS; the accent never equals the base.
 *
 * @method identity
 * @param {String|Number} key
 * @return {{base: Number, accent: Number, pattern: Number}}
 */
export function identity(key) {
    let h = hash(String(key ?? ''));
    let base = h % COLORS.length;
    let accent = (base + 1 + (Math.floor(h / COLORS.length) % (COLORS.length - 1))) % COLORS.length;
    let pattern = Math.floor(h / (COLORS.length * (COLORS.length - 1))) % PATTERNS.length;

    return { base, accent, pattern };
}
