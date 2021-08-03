import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    "dateCreated": "2020-07-01 16:56:07",
    "dateModified": "2020-07-01 16:56:07",
    createdUser() {
        return (_.random(1, 10)).toString();
    },
    modifiedUser() {
        return (_.random(1, 10)).toString();
    },
    "vote": _.random(0,1),
    "relatedId": _.random(1,5),
    "relatedTo": faker.random.arrayElement(["wiki","conversationrooms"]),
    afterCreate(votes) {
        votes.update({
            "createdUserName": `User_${votes.createdUser}`,
            "modifiedUserName": `User_${votes.modifiedUser}`,
        })
    }
});
