/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, settled, waitFor } from '@ember/test-helpers';
import { typeInSelectSearch } from 'prometheus/tests/helpers/select';

const TAGS = '[data-test-issue-tags]';
const MODAL = '[data-test-tags-edit-modal]';

export default function (assert) {
	return (
		steps(assert)
			.given('Project has the tag "$name"', async function (name) {
				server.create('tag', { tag: name, projectId: String(server.schema.issues.findBy({ issueNumber: 1 }).projectId) });
			})
			.given('Issue $number is tagged "$name"', async function (number, name) {
				let issue = server.schema.issues.findBy({ issueNumber: parseInt(number, 10) });
				let projectId = String(issue.projectId);
				let tag = server.create('tag', { tag: name, projectId });
				server.create('tagged', { relatedTo: 'issue', relatedId: String(issue.id), tagId: String(tag.id), projectId, tag });
			})
			.when('User adds the tag "$name" to the issue', async function (name) {
				await click(`${TAGS} [data-test-issue-tags-add]`);
				await waitFor(MODAL);
				await typeInSelectSearch(name);
				await settled();
				await waitFor('.ember-power-select-option:not(.ember-power-select-option--search-message):not(.ember-power-select-option--loading-message)', { timeout: 3000 });
				await click(document.querySelector('.ember-power-select-option'));
				await click(`${MODAL} [data-btn="save"]`);
			})
			.when('User removes the tag "$name" from the issue', async function (name) {
				await click(`${TAGS} [data-test-issue-tags-add]`);
				await waitFor(`${MODAL} [data-test-tag-chip]`);
				let chip = [...document.querySelectorAll(`${MODAL} [data-test-tag-chip]`)].find((el) => el.textContent.trim().startsWith(name));
				await click(chip.querySelector('[data-app-ui-tag-remove]'));
				await click(`${MODAL} [data-btn="save"]`);
			})
			.when('User clicks the tag "$name" of the issue', async function (name) {
				await click(`${TAGS} [data-test-issue-tag="${name}"] [data-test-issue-tag-link]`);
			})
			.then('The issue tags should be a fact next to Parent', async function () {
				assert.dom('.row > [data-field="issue.parentissue"] + [data-field="issue.tags"]').exists();
			})
			.then('The issue should show the tag "$name"', async function (name) {
				assert.dom(`${TAGS} [data-test-issue-tag="${name}"]`).exists();
			})
			.then('The issue tags should have no remove button', async function () {
				assert.dom(`${TAGS} [data-app-ui-tag-remove]`).doesNotExist();
			})
			.then('The issue should not show the tag "$name"', async function (name) {
				assert.dom(`${TAGS} [data-test-issue-tag="${name}"]`).doesNotExist();
			})
			.then('The project should have $count tag named "$name"', async function (count, name) {
				let found = server.schema.tags.all().models.filter((tag) => tag.tag.toLowerCase() === name.toLowerCase());
				assert.equal(found.length, parseInt(count, 10), `${count} tag named ${name}`);
			})
	);
}
