import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    name() {
        return faker.lorem.word()
    },
    "dateCreated": "2018-04-09 18:15:09",
    "dateModified": "2018-04-09 18:15:09",
    "deleted": "0",
    description() {
        return faker.lorem.sentence()
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "system": "0",
    afterCreate(issuetype) {
        issuetype.update({
            "createdUserName": `User_${issuetype.createdUser}`,
            "modifiedUserName": `User_${issuetype.modifiedUser}`,
            "projectId": (_.random(1, 10)).toString()
        })
    },
});
