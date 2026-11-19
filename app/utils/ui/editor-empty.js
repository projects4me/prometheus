/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Whether the content of a rich-text editor is empty: no text once the tags, the non-breaking spaces and the
 * whitespace are stripped, so the `<p><br></p>` of a cleared editor is empty. An image has no text but is content.
 *
 * @method isEditorEmpty
 * @param {String} value The html (or markdown) content
 * @returns {Boolean}
 * @public
 */
export function isEditorEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    const text = String(value)
        .replace(/<img\b[^>]*>/gi, 'image')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;|&#160;/gi, ' ');
    return text.trim() === '';
}
