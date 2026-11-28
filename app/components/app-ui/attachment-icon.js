/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render the application header
 *
 * @class AttachmentIcon
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AttachmentIconComponent extends Component {

    /**
     * The is the mime value based on which a different icon will be displayed.
     * Some possilbe values are text/document, application/powerpoint, etc.
     * 
     * @method get
     * @returns String
     */
    get mime() {
        return this.args.mime ?? '';
    }

    /**
     * Name of the icon (without the fa- prefix) for the mime provided.
     * 
     * @method get
     * @returns String
     */
    get attachmentIcon() {
        let mime = this.mime;
        let mime_parts = mime.split('/');

        let icon = '';

        if (mime_parts[1] !== undefined) {
            if (mime_parts[1].match(/presentation|powerpoint/i)) {
                icon = 'file-powerpoint-o';
            } else if (mime_parts[1].match(/document|word/i)) {
                icon = 'file-word-o';
            } else if (mime_parts[1].match(/excel|spreadsheet/i)) {
                icon = 'file-excel-o';
            } else if (mime_parts[1].match(/pdf/i)) {
                icon = 'file-pdf-o';
            } else if (mime_parts[1].match(/zip|tar|rar|compress/i)) {
                icon = 'file-archive-o';
            } else if (mime_parts[0].match(/audio/i)) {
                icon = 'file-audio-o';
            } else if (mime_parts[0].match(/application/i)) {
                icon = 'file-code-o';
            } else if (mime_parts[0].match(/image/i)) {
                icon = 'file-image-o';
            } else if (mime_parts[0].match(/text/i)) {
                icon = 'file-text-o';
            } else if (mime_parts[0].match(/video/i)) {
                icon = 'file-video-o';
            } else if (mime_parts[0].match(/font/i)) {
                icon = 'font';
            } else {
                icon = 'file-o';
            }
        }
        return icon;
    }
}
