/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

function row(number) {
	return `tr.issue[data-issue-id="${server.schema.issues.findBy({ issueNumber: parseInt(number, 10) }).id}"]`;
}

export default function (assert) {
	return (
		steps(assert)
			.given('Issue $number is tagged "$name"', async function (number, name) {
				let issue = server.schema.issues.findBy({ issueNumber: parseInt(number, 10) });
				let projectId = String(issue.projectId);
				let tag = server.schema.tags.findBy({ tag: name, projectId }) ?? server.create('tag', { tag: name, projectId });
				server.create('tagged', { relatedTo: 'issue', relatedId: String(issue.id), tagId: String(tag.id), projectId, tag });
			})
			.when('User clicks the tag "$name" on issue $number in the list', async function (name, number) {
				await click(`${row(number)} [data-test-issue-list-tag="${name}"]`);
			})
			.then('The issue list shows the tag "$name" on issue $number', async function (name, number) {
				assert.dom(`${row(number)} [data-test-issue-list-tag="${name}"]`).exists();
			})
			.then('The issue list shows $count visible tags and a "$more" chip on issue $number', async function (count, more, number) {
				assert.dom(`${row(number)} [data-test-issue-list-tag]`).exists({ count: parseInt(count, 10) });
				assert.dom(`${row(number)} [data-test-issue-list-tag-more]`).hasText(more);
				assert.dom(`${row(number)} [data-test-issue-list-tag-more]`).hasAttribute('title', 'delta, echo');
			})
	);
}
