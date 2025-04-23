import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
	name() {
		return faker.lorem.word();
	},
	dateCreated() {
		return date.createdDate(30, 40);
	},
	dateModified() {
		return date.modifiedDate(10, 15);
	},
	deleted: '0',
	description() {
		return faker.lorem.sentence();
	},
	createdUser() {
		return _.random(1, 10).toString();
	},
	modifiedUser() {
		return _.random(1, 10).toString();
	},
	system: '1',
	projectId: _.random(1, 10).toString(),
	afterCreate(issuetype) {
		issuetype.update({
			createdUserName: `User_${issuetype.createdUser}`,
			modifiedUserName: `User_${issuetype.modifiedUser}`
		});
	}
});
