import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';

export default Factory.extend({
    dateCreated() {
        return date.createdDate(20, 30);
    },
    dateModified() {
        return date.modifiedDate(1, 4);
    },
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
    username() {
        return faker.internet.userName();
    },
    email() {
        return faker.internet.email();
    },
    status() {
        return faker.random.arrayElement(["active", "pending", "in_progress", "completed", "new"]);
    },
    title() {
        return faker.name.jobTitle();
    },
    phone() {
        return faker.phone.phoneNumber();
    },
    education() {
        return faker.random.arrayElement(["BSCS", "BBA", "MBA", "CA", "BFA"]);
    },
    afterCreate(user) {
        user.update({
            "name": `User_${user.id}`,
            "createdUserName": `User_${user.createdUser}`,
            "modifiedUserName": `User_${user.modifiedUser}`
        })
    }
});
