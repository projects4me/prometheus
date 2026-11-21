import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import steps from '../steps';

const field = (name) => document.querySelector(`[data-field="workspace.${name}"] input, [data-field="workspace.${name}"] textarea`);

export default function (assert) {
	return steps(assert)
		.given('Workspace "$name" with code "$code" exists', function (name, code) {
			server.create('workspace', { name, shortCode: code });
		})
		.when('User fills the workspace form with name "$name" and no code', async function (name) {
			await fillIn(field('name'), name);
		})
		.when('User fills the workspace form with name "$name", code "$code" and description "$description"', async function (name, code, description) {
			await fillIn(field('name'), name);
			await fillIn(field('shortCode'), code);
			await fillIn(field('description'), description);
			await triggerEvent(field('name'), 'focusout');
			await triggerEvent(field('shortCode'), 'focusout');
		})
		.when('User clicks on the workspace save button', async function () {
			await click('[data-btn="save"]');
		})
		.when('User clicks on the workspace cancel button', async function () {
			await click('[data-btn="cancel"]');
		})
		.then('Workspace "$name" with code "$code" is stored', function (name, code) {
			let workspace = server.schema.workspaces.findBy({ shortCode: code });
			assert.ok(workspace, 'workspace exists');
			assert.equal(workspace.name, name, 'name stored');
		})
		.then('The workspace form shows the error "$message"', function (message) {
			assert.ok(document.querySelector('.create-workspace').textContent.includes(message), message);
		})
		.then('The workspace form keeps name "$name" and code "$code"', function (name, code) {
			assert.equal(field('name').value, name, 'name kept');
			assert.equal(field('shortCode').value, code, 'code kept');
		});
}
