import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    subject(i) {
        return `Issue Test ${i}`;
    },
    "dateCreated": "2017-07-01 16:56:07",
    "dateModified": "2016-05-03 00:39:50",
    "deleted": "0",
    description: faker.lorem.sentence(),
    "createdUser": "1",
    "createdUserName": "Hammad Hassan",
    "owner": "1",
    "assignee": "1",
    "reportedUser": "1",
    "modifiedUser": "1",
    "modifiedUserName": "Hammad Hassan",
    issueNumber(i) {
        return `${i}`;
    },
    "endDate": "2016-09-29",
    "startDate": "2016-07-15",
    "status": faker.list.random("new","in_progress","pending","done","wont_fix"),
    "typeId": "1",
    "priority": faker.list.random("medium","high","low","critical","blocker"),
    "projectId": "1",
    "milestoneId": "1",
    "parentId": "",
    "conversationRoomId": ""
});
