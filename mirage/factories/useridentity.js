import { Factory } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';

export default Factory.extend({
	dateCreated() {
		return date.createdDate(20, 30);
	},
	dateModified() {
		return date.modifiedDate(1, 4);
	},
	deleted: '0',
	provider: 'github',
	handle: 'agent-odysseus',
	email: '',
	publicKeyFingerprint: '',
	verified: false,
});
