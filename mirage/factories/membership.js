import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';

export default Factory.extend({
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
    afterCreate(membership) {
        membership.update({
            "createdUserName": `User_${membership.createdUser}`,
            "modifiedUserName": `User_${membership.modifiedUser}`
        })
    },
    roleId() {
        return (_.random(1, 5)).toString();
    },
    projectId() {
        return (_.random(1, 10)).toString();
    },
    userId() {
        return (_.random(1, 10)).toString();
    }
});
