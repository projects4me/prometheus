import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    name() {
        return faker.random.arrayElement(['Admin', 'Developer', 'Project Manager']);
    },
    "dateCreated": "2016-09-21 01:15:32",
    "dateModified": "2016-09-21 01:15:32",
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
