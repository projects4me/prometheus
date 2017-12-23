/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This helper is used to get the icon for the file attachment
 *
 * @method AttachmentIcon
 * @param Mime {String} The file mime type
 * @return HTML {String} The HTML of the font-awesome icon
 * @todo Optimize
 */
export function attachmentIcon(params) {
    let mime_parts = params[0].split('/');

    let HTML = '';

    if (mime_parts[1].match(/presentation|powerpoint/i)) {
        HTML = '<i class="fa fa-file-powerpoint-o"></i>';
    } else if (mime_parts[1].match(/document|word/i)) {
        HTML = '<i class="fa fa-file-word-o"></i>';
    } else if (mime_parts[1].match(/excel|spreadsheet/i)) {
        HTML = '<i class="fa fa-file-excel-o"></i>';
    } else if (mime_parts[1].match(/pdf/i)) {
        HTML = '<i class="fa fa-file-pdf-o"></i>';
    } else if (mime_parts[1].match(/zip|tar|rar|compress/i)) {
        HTML = '<i class="fa fa-file-archive-o"></i>';
    } else if (mime_parts[0].match(/audio/i)) {
        HTML = '<i class="fa fa-file-audio-o"></i>';
    } else if (mime_parts[0].match(/application/i)) {
        HTML = '<i class="fa fa-file-code-o"></i>';
    } else if (mime_parts[0].match(/image/i)) {
        HTML = '<i class="fa fa-file-image-o"></i>';
    } else if (mime_parts[0].match(/text/i)) {
        HTML = '<i class="fa fa-file-text-o"></i>';
    } else if (mime_parts[0].match(/video/i)) {
        HTML = '<i class="fa fa-file-video-o"></i>';
    } else if (mime_parts[0].match(/font/i)) {
        HTML = '<i class="fa fa-font"></i>';
    } else {
        HTML = '<i class="fa fa-file-o"></i>';
    }

    return Ember.String.htmlSafe(HTML);
}

/**
 * The object that provides the AttachmentIcon helper function
 *
 * @class AttachmentIcon
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Helper.helper(attachmentIcon);