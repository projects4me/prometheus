/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This helper is used to convert a file size in bytes into KB, MB, GB, etc
 *
 * @method FileSize
 * @param {Integer} filesize The size of file in bytes
 * @return {String} filesize The size in byte units
 * @todo Handle number format
 * @todo Translate :(, cannot find a way to call the translate function at this time
 */
export function fileSize(params) {

    let fileSize = params[0];
    let unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    for (let i = 0; i < unit.length; i++) {
        if (fileSize < 1024) {
            fileSize = parseFloat(fileSize).toFixed(2)+' '+unit[i];
            break;
        }
        fileSize /= 1024;
    }
    return fileSize;
}

/**
 * The object that provides the fileSize helper function
 *
 * @class FileSize
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(fileSize);
