import { click, findAll } from '@ember/test-helpers';
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
		when('User clicks the edit tags button of the thread', async function () {
			await click(`${BOX} [data-btn="edit-tags"]`);
			assert.ok(true, 'User clicks the edit tags button');
		}).
		then('The tags modal is open', function () {
			assert.dom('[data-test-tags-edit-modal]').exists();
		}).
		then('The thread tags have no remove buttons', function () {
			assert.dom(`${BOX} [data-app-ui-tag-remove]`).doesNotExist();
		}).
		then('The thread shows the tags "$names"', function (names) {
			let expected = names.split(',').map((name) => name.trim());
			assert.deepEqual(findAll(`${BOX} [data-tag-chip] [data-app-ui-tag-text]`).map((el) => el.textContent.trim()), expected);
		}).
		then('The thread shows no tags', function () {
			assert.dom(`${BOX} [data-tag-chip]`).doesNotExist();
			assert.dom(`${BOX} [data-tags-empty]`).exists();
		});
}
