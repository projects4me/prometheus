import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

// Define a mapping of status values to IDs
const STATUS_MAP = {
  "new": "1",
  "in_progress": "2",
  "done": "3",
  "feedback": "4",
  "pending": "5",
  "deferred": "6"
};

export default Factory.extend({
    subject(i) {
        return `Issue Test ${++i}`;
    },
    dateCreated() {
        return date.createdDate(10, 30);
    },
    dateModified() {
        return date.modifiedDate(5, 7);
    },
    projectShortcode(i) {
        return `PROJECT_${++i}`;
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
        return `${++i}`;
    },
    endDate() {
        return date.endDate(1, 5);
    },
    startDate(){
        return date.startDate(10, 30);
    },
    status() {
        return faker.random.arrayElement(Object.keys(STATUS_MAP));
    },
    statusId() {
        return STATUS_MAP[this.status];
    },
    priority() {
        return faker.random.arrayElement(["medium", "high", "low", "critical", "blocker"]);
    },
    isPlanned() {
        return '0';
    }
});
