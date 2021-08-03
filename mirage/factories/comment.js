import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    "dateCreated": "2020-07-01 16:56:07",
    "dateModified": "2020-07-01 16:56:07",
    "deleted": "0",
    comment() {
        return faker.lorem.sentence();
    },
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "relatedTo": "conversationroom",
    relatedId() {
        return (_.random(1, 5)).toString();
    },
    afterCreate(comment) {
        comment.update({
            "createdUserName": `User_${comment.createdUser}`,
            "modifiedUserName": `User_${comment.modifiedUser}`,
        })
    }
});
