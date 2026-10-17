import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    name(i) {
        let statuses = ["new", "in_progress", "in_review", "done", "feedback", "pending", "deferred"];
        return statuses[i++];
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
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "system": "0",
    color: "#80b5d3",
    sortOrder(i) {
        return i + 1;
    },
    done() {
        return (_.random(0, 1)).toString();
    },
});
