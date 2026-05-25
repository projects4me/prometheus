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
	name() {
		return faker.random.arrayElement([
			'EmberJS',
			'Phalcon',
			'PHP',
			'JavaScript',
			'Node.js',
		]);
	},
	proficiencyLevel() {
		return faker.random.arrayElement([
			'beginner',
			'intermediate',
			'advanced',
			'expert',
		]);
	},
	afterCreate(userskill) {
		userskill.update({
			createdUserName: `User_${userskill.createdUser}`,
			modifiedUserName: `User_${userskill.modifiedUser}`,
		});
	},
});
