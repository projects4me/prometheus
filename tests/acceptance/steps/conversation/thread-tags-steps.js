import { click, fillIn, waitUntil, find, findAll } from '@ember/test-helpers';
import voteThreadSteps from './vote-thread-steps';

const BOX = '[data-tags-box]';

// Builds on the vote thread steps (opening a thread from the latest conversations)
export default function (assert) {
	return voteThreadSteps(assert).
		given('Project has the tags "$names"', function (names) {
			for (let name of names.split(',')) {
				server.create('tag', { tag: name.trim(), projectId: '1' });
			}
			assert.ok(true, `Project has the tags ${names}`);
		}).
		given('Conversation $conversationIndex has the tag "$name"', function (conversationIndex, name) {
			let tag = server.schema.tags.findBy({ tag: name });
			server.create('tagged', { relatedTo: 'conversationroom', relatedId: String(conversationIndex), tagId: String(tag.id), projectId: '1', tag });
			assert.ok(true, `Conversation ${conversationIndex} has the tag ${name}`);
		}).
		when('User types "$text" in the thread tags field', async function (text) {
			await click(`${BOX} .ember-power-select-trigger`);
			await fillIn(`${BOX} .ember-power-select-search-input, ${BOX} .ember-power-select-trigger-multiple-input`, text);
			assert.ok(true, `User types ${text} in the thread tags field`);
		}).
		when('User chooses the option "$text" of the thread tags field', async function (text) {
			await waitUntil(() => findAll(`${BOX} .ember-power-select-option`).some((el) => el.textContent.includes(text)));
			await click(findAll(`${BOX} .ember-power-select-option`).find((el) => el.textContent.includes(text)));
			await waitUntil(() => !find(`${BOX} .ember-power-select-dropdown`) || true);
			assert.ok(true, `User chooses ${text}`);
		}).
		when('User removes the tag "$name" from the thread', async function (name) {
			let chip = findAll('[data-tag-chip]').find((el) => el.textContent.includes(name));
			await click(chip.querySelector('[data-app-ui-tag-remove]'));
			assert.ok(true, `User removes the tag ${name}`);
		}).
		then('The thread shows the tags "$names"', function (names) {
			let expected = names.split(',').map((name) => name.trim());
			assert.deepEqual(findAll(`${BOX} [data-tag-chip] [data-app-ui-tag-text]`).map((el) => el.textContent.trim()), expected);
		}).
		then('The thread shows no tags', function () {
			assert.dom(`${BOX} [data-tag-chip]`).doesNotExist();
			assert.dom(`${BOX} [data-tags-empty]`).exists();
		}).
		then('The project has $count tags', function (count) {
			assert.equal(server.schema.tags.all().length, parseInt(count));
		}).
		then('The thread tags field is not shown', function () {
			assert.dom(`${BOX} [data-tags-edit]`).doesNotExist();
			assert.dom(`${BOX} [data-app-ui-tag-remove]`).doesNotExist();
		});
}
