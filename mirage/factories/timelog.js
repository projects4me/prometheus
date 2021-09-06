import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(3, 5);
    },
    "deleted": "0",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    issueId() {
        return (_.random(1, 10)).toString();
    },
    minutes() {
        return (_.random(0, 60)).toString();
    },
    hours() {
        return (_.random(1, 12)).toString();
    },
    days() {
        return (_.random(0, 30)).toString();
    },
    context() {
        return faker.random.arrayElement(["spent", "est"]);
    },
    description() {
        return faker.lorem.sentence();
    },
    "spentOn": "2019-04-09 03:16:21"
});
