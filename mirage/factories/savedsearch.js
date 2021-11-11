import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    name() {
        return faker.lorem.text();
    },
    dateCreated() {
        return date.createdDate(1, 5);
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    "deleted": "0",
    public() {
        return faker.random.arrayElement(["0", "1"]);
    },
    "searchquery": "",
    "relatedTo": "project",
    projectId() {
        return (_.random(1, 10)).toString();
    },
    afterCreate(project) {
        project.update({
            "createdUserName": `User_${project.createdUser}`,
        })
    }
});
