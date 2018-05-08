import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    "name": faker.lorem.word(),
    "dateCreated": "2016-03-27 02:28:20",
    "dateModified": "2015-12-19 16:44:09",
    "deleted": "0",
    "description":faker.lorem.sentence(),
    "createdUserName": "Hammad Hassan",
    "modifiedUserName": "Hammad Hassan",
    "endDate": "2017-06-16",
    "startDate": "2017-08-26",
    "status": "in_progress",
    "milestoneType": "release",
    "projectId": "1"
});
