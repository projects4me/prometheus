import Component from '@glimmer/component';
import Logger from 'js-logger';

export default class AttachmentIconComponent extends Component {

    get attachmentIcon() {
        let mime =this.mime;
        Logger.debug(`Mime is :${mime}`);
        let mime_parts = mime.split('/');
        
        Logger.debug(`Mime is : ${mime}`);
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
