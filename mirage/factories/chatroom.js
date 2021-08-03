import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    subject(i) {
        return `chatroom test ${i}`;
    },
    "dateCreated": "2020-07-01 16:56:07",
    "dateModified": "2020-08-01 13:56:07",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "deleted": "0",
    status() {
        return faker.random.arrayElement(["active", "offline", "busy"]);
    },
    "type": "private",
    afterCreate(chatroom) {
        chatroom.update({
            "createdUserName": `User_${chatroom.createdUser}`,
            "modifiedUserName": `User_${chatroom.modifiedUser}`,
        })
    }
});
