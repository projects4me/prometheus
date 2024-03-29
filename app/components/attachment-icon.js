import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';
import Logger from 'js-logger';

export default class AttachmentIconComponent extends Component {

    get attachmentIcon() {
        let mime =this.mime;
        Logger.debug(`Mime is :${mime}`);
        let mime_parts = mime.split('/');
        
        Logger.debug(`Mime is : ${mime}`);
        let HTML = '';

        if (mime_parts[1] !== undefined) {
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
        }
        return htmlSafe(HTML);
        }
    }
