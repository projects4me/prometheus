import { Factory } from 'miragejs';
import Context from '../yadda-context/context';
import { faker } from '@faker-js/faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    relatedTo() {
        return faker.helpers.arrayElement(["project", "issue"])
    },
    relatedId() {
        return (_.random(1, 5)).toString();
    },
    dateCreated() {
        return date.createdDate(10, 20);
    },
    type() {
        return faker.helpers.arrayElement(["updated", "created", "related", "deleted", "closed"])
    },
    afterCreate(activity) {
        let ctx = new Context();
        if (activity.type == "related") {
            activity.update({
                "relatedActivity": faker.helpers.arrayElement(["created", "updated", "attached", "deleted"]),
                "relatedActivityId": (_.random(1, 5)).toString(),
                "relatedActivityModule": "milestone"
            })
        }
        activity.update({
            "userId": ctx.get('currentUser').id,
        })
    }
});
