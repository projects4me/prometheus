import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(10, 15);
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
    vote() {
        return (_.random(0, 1)).toString();
    },
    relatedId() {
        return (_.random(1, 5)).toString();
    },
    relatedTo() {
        return faker.random.arrayElement(["wiki", "conversationrooms"])
    },
    afterCreate(votes) {
        votes.update({
            "createdUserName": `User_${votes.createdUser}`,
            "modifiedUserName": `User_${votes.modifiedUser}`,
        })
    }
});
