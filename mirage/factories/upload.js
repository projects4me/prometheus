import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    "name": "logo.png",
    "dateCreated": "2018-04-09 18:15:09",
    "dateModified": "2018-04-09 18:15:09",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "status": "",
    "relatedId": "",
    "fileType": "",
    "fileSize": "",
    "fileMime": "",
    "filePath": "",
    "fileThumbnail": "",
    "fileDestination": "",
    "downloadLink": ""
});
