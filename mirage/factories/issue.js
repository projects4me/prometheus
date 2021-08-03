import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    subject(i) {
        return `Issue Test ${i}`;
    },
    "dateCreated": "2017-07-01 16:56:07",
    "dateModified": "2016-05-03 00:39:50",
    "deleted": "0",
    description: faker.lorem.sentence(),
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
    "endDate": "2016-09-29",
    "startDate": "2016-07-15",
    status() {
        return faker.random.arrayElement(["new", "in_progress", "pending", "done", "wont_fix"]);
    },
    priority() {
        return faker.random.arrayElement(["medium", "high", "low", "critical", "blocker"]);
    },
});
