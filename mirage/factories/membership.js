import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    "dateCreated": "2018-04-09 11:15:31",
    "dateModified": "2018-04-09 11:15:31",
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
