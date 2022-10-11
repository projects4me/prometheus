import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import faker from 'faker';
import Context from '../yadda-context/context';

export default Factory.extend({
    subject(i) {
        return `Issue Test ${++i}`;
    },
    issueNumber(i) {
        return `${++i}`;
    },
    status() {
        return faker.random.arrayElement(["new", "in_progress", "done", "feedback", "pending", "deferred"]);
    },
    dateCreated() {
        return date.createdDate(10, 30);
    },
    lastActivityDate() {
        return date.createdDate(10, 30);
    },
    afterCreate(issue) {
        let ctx = new Context();
        issue.update({
            "userId": ctx.get('currentUser').id,
            "projectId": ctx.get('currentProject').id,
            "projectShortCode": ctx.get('currentProject').shortCode
        })
    }
});
