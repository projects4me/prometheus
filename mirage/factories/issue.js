import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    subject(i) {
        return `Issue Test ${i}`;
    },
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    "deleted": "0",
    description() {
        return faker.lorem.sentence();
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    owner() {
        return (_.random(1, 10)).toString();
    },
    assignee() {
        return (_.random(1, 10)).toString();
    },
    reportedUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    issueNumber(i) {
        return `${i}`;
    },
    endDate() {
        return date.endDate(1, 5);
    },
    startDate(){
        return date.startDate(10, 30);
    },
    status() {
        return faker.random.arrayElement(["new", "in_progress", "pending", "done", "wont_fix"]);
    },
    priority() {
        return faker.random.arrayElement(["medium", "high", "low", "critical", "blocker"]);
    },
});
