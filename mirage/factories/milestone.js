import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    name() {
        return faker.lorem.word();
    },
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(5, 8);
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
    endDate() {
        return date.endDate(1, 10);
    },
    startDate(){
        return date.startDate(30, 40);
    },
    status() {
        return faker.random.arrayElement(["in_progress", "planned"]);
    },
    milestoneType() {
        return faker.random.arrayElement(["milestone", "version", "patch", "release", "sprint"]);
    },
    afterCreate(milestone) {
        milestone.update({
            "createdUserName": `User_${milestone.createdUser}`,
            "modifiedUserName": `User_${milestone.modifiedUser}`
        })
    },
});
