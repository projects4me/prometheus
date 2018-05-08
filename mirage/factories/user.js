import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    name: "Hammad Hassan",
    "dateCreated": "2015-03-03 01:02:03",
    "dateModified": "2015-03-03 01:02:03",
    "deleted": "0",
    description: faker.lorem.sentence(),
    "createdUser": "1",
    "createdUserName": "Hammad Hassan",
    "modifiedUser": "1",
    "modifiedUserName": "Hammad Hassan",
    username: faker.internet.userName(),
    email: faker.internet.email(),
    "status": "Active",
    "title": faker.name.jobTitle(),
    "phone": "",
    education: "BS in education",
});
