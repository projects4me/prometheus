/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Converts a file object (from ember-file-upload's file-queue) to a base64
 * data URI string using the browser FileReader API.
 *
 * @function fileToBase64
 * @param {Object} file - The file object provided by ember-file-upload
 * @return {Promise<string>} Resolves with the base64 data URI
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.file);
    });
}

/**
 * Fetches a public asset by path and converts it to a base64 data URI string.
 * Uses fetch() to retrieve the image as a blob, then FileReader to encode it.
 *
 * @function imagePathToBase64
 * @param {String} path - Public asset path e.g. '/img/default.png'
 * @return {Promise<string>} Resolves with the base64 data URI
 */
export function imagePathToBase64(path) {
    return fetch(path)
        .then((response) => response.blob())
        .then((blob) => new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));
}
