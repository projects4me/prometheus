import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    subject(i) {
        return `chatroom test ${i}`;
    },
    dateCreated() {
        return date.createdDate(20, 30);
    },
    dateModified() {
        return date.modifiedDate(1, 10);
    },
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
