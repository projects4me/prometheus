/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The reference to an upload kept in markdown: an image is stored as ![<file name>](upload:<uploadId>),
 * without a token or host. Readers of the markdown resolve the reference to an address themselves.
 *
 * @class UploadReference
 * @namespace Prometheus.Utils
 */

/**
 * Matches an image whose source is an upload reference, capturing the alt text and the upload id
 *
 * @property UPLOAD_IMAGE_RX
 * @type RegExp
 * @private
 */
const UPLOAD_IMAGE_RX = /!\[([^\]]*)\]\(upload:([^)\s]+)\)/g;

/**
 * The reference to an upload
 *
 * @method uploadReference
 * @param {String} uploadId
 * @return {String}
 * @public
 */
export function uploadReference(uploadId) {
    return `upload:${uploadId}`;
}

/**
 * The ids of the uploads whose images the markdown shows, each once
 *
 * @method uploadImageIds
 * @param {String} markdown
 * @return {Array}
 * @public
 */
export function uploadImageIds(markdown) {
    return [...new Set([...(markdown ?? '').matchAll(UPLOAD_IMAGE_RX)].map(([, , id]) => id))];
}

/**
 * Replaces every upload image of the markdown with what `replace(alt, uploadId)` returns
 *
 * @method replaceUploadImages
 * @param {String} markdown
 * @param {Function} replace
 * @return {String}
 * @public
 */
export function replaceUploadImages(markdown, replace) {
    return (markdown ?? '').replace(UPLOAD_IMAGE_RX, (match, alt, uploadId) => replace(alt, uploadId));
}

/**
 * Replaces the image sources of the markdown found in `references` (address => reference) with their reference
 *
 * @method referenceImageSources
 * @param {String} markdown
 * @param {Map} references
 * @return {String}
 * @public
 */
export function referenceImageSources(markdown, references) {
    let result = markdown ?? '';
    references.forEach((reference, address) => {
        result = result.split(`](${address})`).join(`](${reference})`);
    });
    return result;
}
