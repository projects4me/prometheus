import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    name() {
        return faker.lorem.word();
    },
    "dateCreated": "2016-03-27 02:28:20",
    "dateModified": "2015-12-19 16:44:09",
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
    "endDate": "2017-06-16",
    "startDate": "2017-08-26",
    status() {
        return faker.random.arrayElement(["completed", "closed", "in_progess", "planned", "complete", "overdue", "deferred", "failed"]);
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
