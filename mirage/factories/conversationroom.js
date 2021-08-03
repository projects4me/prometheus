import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    subject(i) {
        return `conversationroom test ${i}`;
    },
    "dateCreated": "2020-07-01 16:56:07",
    "dateModified": "2020-07-01 16:56:07",
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
    issueId() {
        return (_.random(1, 10)).toString();
    },
    afterCreate(conversationroom) {
        conversationroom.update({
            "createdUserName": `User_${conversationroom.createdUser}`,
            "modifiedUserName": `User_${conversationroom.modifiedUser}`,
        })
    }
});
