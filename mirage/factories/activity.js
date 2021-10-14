import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 20);
    },
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
    afterCreate(activity) {
        if (activity.type == "related") {
            activity.update({
                "relatedActivity": faker.random.arrayElement(["created", "updated", "attached", "deleted"]),
                "relatedActivityId": (_.random(1, 5)).toString(),
                "relatedActivityModule": "milestone"
            })
        }
        activity.update({
            "createdUserName": `User_${activity.createdUser}`,
        })
    }
});
