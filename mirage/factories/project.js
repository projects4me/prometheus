import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    name() {
        return faker.lorem.word();
    },
    "dateCreated": "2018-04-09 11:15:09",
    "dateModified": "2018-04-09 11:15:09",
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
    "startDate": "2015-03-19",
    "endDate": "2028-03-19",
    "shortCode": "APROM",
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
            "modifiedUserName": `User_${project.modifiedUser}`
        })
    }
});
