import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
	dateCreated() {
		return date.createdDate(20, 30);
	},
	dateModified() {
		return date.modifiedDate(1, 4);
	},
	deleted: '0',
	createdUser() {
		return _.random(1, 10).toString();
	},
	modifiedUser() {
		return _.random(1, 10).toString();
	},
	type() {
		return 'education';
	},
	title() {
		return faker.random.arrayElement(['BSCS', 'BBA', 'MBA', 'CA', 'BFA']);
	},
	institution() {
		return faker.company.companyName();
	},
	completionYear() {
		return moment().year();
	},
	afterCreate(userqualification) {
		userqualification.update({
			createdUserName: `User_${userqualification.createdUser}`,
			modifiedUserName: `User_${userqualification.modifiedUser}`,
		});
	},
});
