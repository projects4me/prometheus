import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    "name": faker.list.cycle('Admin', 'Developer', 'Project Manager'),
    "dateCreated": "2016-09-21 01:15:32",
    "dateModified": "2016-09-21 01:15:32",
    "deleted": "0",
    "description": faker.lorem.sentence(),
    "createdUser": "1",
    "createdUserName": "Hammad Hassan",
    "modifiedUser": "1",
    "modifiedUserName": "Hammad Hassan"
});
