import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    "name": faker.random.arrayElement(['Admin', 'Developer', 'Project Manager']),
    "dateCreated": "2016-09-21 01:15:32",
    "dateModified": "2016-09-21 01:15:32",
    "deleted": "0",
    "description": faker.lorem.sentence(),
    "createdUser": "1",
    "createdUserName": "Hammad Hassan",
    "modifiedUser": "1",
    "modifiedUserName": "Hammad Hassan"
});
