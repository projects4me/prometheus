import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    name() {
        return faker.company.companyName(0);
    },
    dateCreated() {
        return date.createdDate(20, 30);
    },
    dateModified() {
        return date.modifiedDate(1, 6);
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    assignee() {
        return (_.random(1, 10)).toString();
    },
    "deleted": "0",
    description() {
        return faker.lorem.sentence();
    },
    endDate() {
        return date.endDate(10, 20);
    },
    startDate() {
        return date.startDate(10, 20);
    },
    status() {
        return faker.random.arrayElement(["new", "in_progress", "pending", "done", "wont_fix"]);
    },
    "estimatedBudget": null,
    "spentBudget": null,
    type() {
        return faker.random.arrayElement(["scrum", "kanban"]);
    },
    scope() {
        return faker.lorem.text();
    },
    vision() {
        return faker.lorem.text();
    },
    afterCreate(project) {
        project.update({
            "createdUserName": `User_${project.createdUser}`,
            "modifiedUserName": `User_${project.modifiedUser}`,
            "shortCode": (project.name.split(' '))[0].toUpperCase()
        })
    }
});
