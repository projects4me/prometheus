import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
	description(i) {
		return `Test notification ${i + 1}`;
	},

	dateCreated() {
		return faker.date.recent();
	},

	context(i) {
		return {
			userId: faker.number.int({ min: 1, max: 10 }).toString(),
			userName: faker.internet.userName(),
			projectId: faker.number.int({ min: 1, max: 10 }).toString(),
			projectShortcode: faker.helpers.arrayElement(['TST', 'DEV', 'PRJ']),
			projectName: `project_${++i}`,
			issueNumber: `issue_${++i}`,
			relatedTo: 'project'
		};
	},

	relatedTo: 'project',

	relatedId() {
		return faker.number.int({ min: 1, max: 10 }).toString();
	},

	createdUser() {
		return faker.number.int({ min: 1, max: 10 }).toString();
	},

	createdUserName() {
		return faker.internet.userName();
	},

	afterCreate(systemnotification, server) {
		server.create('systemnotificationrecipient', {
			systemnotificationId: systemnotification.id,
			userId: server.schema.users.first()?.id || '1',
			isRead: faker.helpers.arrayElement(['0', '1'])
		});
	}
});
