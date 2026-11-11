import { Factory, association } from 'ember-cli-mirage';
import * as date from '../helpers/getDate';
import _ from 'lodash';

const titles = [
	'Getting started guide',
	'Release checklist',
	'API conventions',
	'Onboarding notes',
	'Incident runbook',
	'Architecture overview'
];

export default Factory.extend({
	project: association(),
	owner: association(),
	title(i) {
		return titles[i % titles.length];
	},
	body(i) {
		return `<p>${titles[i % titles.length]} for the team.</p>`;
	},
	locked: false,
	createdUser() {
		return (_.random(1, 10)).toString();
	},
	modifiedUser() {
		return (_.random(1, 10)).toString();
	},
	dateCreated() {
		return date.createdDate(10, 20);
	},
	dateModified() {
		return date.modifiedDate(1, 5);
	},
	afterCreate(doc, server) {
		// A doc comes with an owner and a couple of tags, tagged rows relate to it as 'doc'.
		if (doc.tagIds && doc.tagIds.length) {
			return;
		}
		let tags = server.createList('tag', 2);
		tags.forEach(tag => server.create('tagged', { relatedTo: 'doc', relatedId: doc.id, tagId: tag.id }));
		doc.update({ tag: tags });
	}
});
