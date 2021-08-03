import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    "dateCreated": "2017-07-01 16:56:07",
    description() {
        return faker.lorem.sentence();
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    "relatedTo": "project",
    relatedId() {
        return (_.random(1, 5)).toString();
    },
    type() {
        return faker.random.arrayElement(["updated", "created", "related", "mentioned", "deleted", "closed"])
    },
    "deleted": "0",
    relatedActivity() {
        return faker.random.arrayElement(["created", "updated", "attached", "deleted"]);
    },
    relatedActivityId() {
        return (_.random(1, 5)).toString();
    },
    "relatedActivityModule": "milestone",
    afterCreate(activity) {
        activity.update({
            "createdUserName": `User_${activity.createdUser}`,
        })
    }
});
