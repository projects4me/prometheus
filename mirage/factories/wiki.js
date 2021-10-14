import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    name() {
        return faker.lorem.word();
    },
    dateCreated() {
        return date.createdDate(10, 20);
    },
    dateModified() {
        return date.modifiedDate(1, 5);
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "deleted": "0",
    "status": "published",
    "locked": "0",
    upvotes() {
        return (_.random(1, 5)).toString();
    },
    projectId() {
        return (_.random(1, 10)).toString();
    },
    markUp() {
        return faker.lorem.sentence();
    },
    parentId() {
        return (_.random(1, 5)).toString();
    },
    afterCreate(votes) {
        votes.update({
            "createdUserName": `User_${votes.createdUser}`,
            "modifiedUserName": `User_${votes.modifiedUser}`,
        })
    }
});
