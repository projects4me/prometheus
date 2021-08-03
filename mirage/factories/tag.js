import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    tag() {
        return faker.lorem.word();
    },
    "dateCreated": "2018-04-09 18:15:09",
    "dateModified": "2018-04-09 18:15:09",
    "deleted": "0",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    afterCreate(tag) {
        tag.update({
            "createdUserName": `User_${tag.createdUser}`,
            "modifiedUserName": `User_${tag.modifiedUser}`,
        })
    },
});
