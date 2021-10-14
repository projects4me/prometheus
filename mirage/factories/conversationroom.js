import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    subject(i) {
        return `conversationroom test ${i}`;
    },
    dateCreated() {
        return date.createdDate(5, 10);
    },
    dateModified() {
        return date.modifiedDate(1, 2);
    },
    "deleted": "0",
    description() {
        return faker.lorem.sentence();
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    roomType() {
        return faker.random.arrayElement(["vote", "discussion"])
    },
    afterCreate(conversationroom) {
        conversationroom.update({
            "createdUserName": `User_${conversationroom.createdUser}`,
            "modifiedUserName": `User_${conversationroom.modifiedUser}`,
        })
    }
});
