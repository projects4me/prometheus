import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import * as date from '../helpers/getDate';
import * as dates from 'prometheus/utils/date';
import _ from 'lodash';

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
    email() {
        return faker.internet.email();
    },
    dateOfBirth() {
        return dates.format(dates.now(), 'DD-MM');
    },
    language() {
        return faker.helpers.arrayElement(["English", "German", "Azerbaijani", "French"]);
    },
    timezone() {
        return dates.guessTimezone();
    },
    status() {
        return faker.helpers.arrayElement(["active", "pending", "in_progress", "completed", "new"]);
    },
    accountStatus: "active",
    title() {
        return faker.person.jobTitle();
    },
    phone() {
        return faker.phone.number();
    },
    education() {
        return faker.helpers.arrayElement(["BSCS", "BBA", "MBA", "CA", "BFA"]);
    },
    afterCreate(user) {
        user.update({
            "name": `User_${user.id}`,
            "createdUserName": `User_${user.createdUser}`,
            "modifiedUserName": `User_${user.modifiedUser}`,
            "githubUrl": `github.com/${user.id}`,
            "gitlabUrl": `gitlab.com/${user.id}`,
            "skypeUrl": `${user.id}`,
            "linkedinUrl": `linkedin.com/in/${user.id}`,
            "slackUrl": `${user.id}`
        });
    }
});
