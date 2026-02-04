import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

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
    issueNumber() {
        return faker.random.arrayElement(["1", "2", "3"]);
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
    projectShortcode() {
        return faker.random.arrayElement(["PRJ1", "PRJ2", "PRJ3"]);
    },
    roomType() {
        return "discussion";
    },
    afterCreate(conversationroom) {
        conversationroom.update({
            "createdUserName": `User_${conversationroom.createdUser}`,
            "modifiedUserName": `User_${conversationroom.modifiedUser}`,
        })
    }
});
