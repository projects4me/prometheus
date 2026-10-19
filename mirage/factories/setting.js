import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
	name: 'email.smtpHost',
	groupName: 'email',
	settingValue: null,
	secure: false,
	isSet: false,
	storedValue: null
});
