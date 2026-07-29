/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

export default Factory.extend({
	dateCreated() {
		return date.createdDate(10, 20);
	},
	dateModified() {
		return date.modifiedDate(1, 5);
	},
	createdUser() {
		return (_.random(1, 10)).toString();
	},
	modifiedUser() {
		return (_.random(1, 10)).toString();
	},
	userId() {
		return (_.random(1, 10)).toString();
	},
	roleId() {
		return (_.random(1, 5)).toString();
	},
	afterCreate(userrole) {
		userrole.update({
			createdUserName: `User_${userrole.createdUser}`,
			modifiedUserName: `User_${userrole.modifiedUser}`,
		});
	},
});
