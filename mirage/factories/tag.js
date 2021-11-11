import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
    tag() {
        return faker.lorem.word();
    },
    dateCreated() {
        return date.createdDate(15, 18);
    },
    dateModified() {
        return date.modifiedDate(6, 10);
    },
    "deleted": "0",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    afterCreate(tag) {
        tag.update({
            "createdUserName": `User_${tag.createdUser}`,
            "modifiedUserName": `User_${tag.modifiedUser}`,
        })
    },
});
