import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    "name": faker.lorem.word(),
    "dateCreated": "2018-04-09 11:15:09",
    "dateModified": "2018-04-09 11:15:09",
    "createdUser": "1",
    "createdUserName": "Hammad Hassan",
    "modifiedUser": "1",
    "modifiedUserName": "Hammad Hassan",
    "assignee": "1",
    "deleted": "0",
    "description": faker.lorem.text(),
    "startDate": "2015-03-19",
    "endDate": "2028-03-19",
    "shortCode": "APROM",
    "status": faker.list.random("new","in_progress","pending","done","wont_fix"),
    "estimatedBudget": null,
    "spentBudget": null,
    "type": faker.list.random("scrum","kanban"),
    "scope": faker.lorem.text(),
    "vision": faker.lorem.text()
});
