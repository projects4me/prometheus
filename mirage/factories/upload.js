import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    "name": "logo.png",
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(3, 6);
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "status": "uploaded",
    "relatedId": "1",
    "fileType": "image/png",
    "fileSize": "7725",
    "fileMime": "image/png",
    "fileThumbnail": "0",
    "fileDestination": "filesystem",
    "downloadLink": "",
    afterCreate(upload) {
        upload.update({
            "filePath": `/var/www/html/projects/projects4me/filesystem/upload/${upload.id}`
        })
    }
});
