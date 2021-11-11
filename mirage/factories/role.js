import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    name() {
        return faker.random.arrayElement(['Admin', 'Developer', 'Project Manager']);
    },
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(1, 5);
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
    afterCreate(project) {
        project.update({
            "createdUserName": `User_${project.createdUser}`,
            "modifiedUserName": `User_${project.modifiedUser}`
        })
    }
});
