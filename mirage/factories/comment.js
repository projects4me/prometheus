import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(1, 5);
    },
    "deleted": "0",
    comment() {
        return faker.lorem.sentence();
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    relatedTo() {
        return faker.random.arrayElement(["conversationroom", "chatroom"]);
    },
    relatedId() {
        return (_.random(1, 5)).toString();
    },
    afterCreate(comment) {
        comment.update({
            "createdUserName": `User_${comment.createdUser}`,
            "modifiedUserName": `User_${comment.modifiedUser}`,
        });
    }
});
