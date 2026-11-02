/* global server */
import { visit, settled, click } from '@ember/test-helpers';
import steps from '../steps';
import agentFixtureSteps from './agent-fixtures';

const field = (name) => document.querySelector(`[data-agent-field="${name}"]`)?.textContent.replace(/\s+/g, ' ').trim();

export default function (assert) {
	return agentFixtureSteps(steps(assert))
		.when('User opens the detail page of agent "$name"', async function (name) {
			let agent = server.schema.agents.findBy({ name });
			await visit(`/app/agent/${agent.id}`);
			await settled();
			assert.ok(true, `User opened the detail page of ${name}`);
		})
		.then('The agent detail shows the AGENT label', function () {
			assert.ok(document.querySelector('[data-agent-box="header"] [data-agent-badge]'), 'The agent detail shows the AGENT label');
		})
		.then('The agent detail shows sponsor "$sponsor", model simple "$simple" and model complex "$complex"', function (sponsor, simple, complex) {
			assert.equal(field('sponsor'), sponsor, 'sponsor');
			assert.equal(field('model-simple'), simple, 'model simple');
			assert.equal(field('model-complex'), complex, 'model complex');
		})
		.then('The credentials box says the agent has no credentials', function () {
			assert.ok(document.querySelector('[data-credential-field="none"]'), 'The credentials box says the agent has no credentials');
		})
		.when('User issues credentials for the agent', async function () {
			await click('[data-btn="issue-secret"]');
			await settled();
		})
		.when('User rotates the secret of the agent', async function () {
			await click('[data-btn="rotate-secret"]');
			await settled();
		})
		.then('The new secret is shown once with the gaia-mcp.env lines', function () {
			let secret = document.querySelector('[data-credential-field="new-secret"]').value;
			assert.ok(secret.startsWith('p4m_cs_'), 'The new secret is shown');
			assert.ok(document.querySelector('[data-credential-field="env"]').textContent.includes(`GAIA_CLIENT_SECRET=${secret}`), 'The env lines hold the secret');
		})
		.when('User closes the new secret', async function () {
			await click('.agent-secret-modal [data-btn="cancel"]');
			await settled();
		})
		.then('The credentials box shows the client ID and a masked secret', function () {
			assert.ok(document.querySelector('[data-credential-field="client-id"]').textContent.trim().length > 0, 'client ID');
			assert.notOk(document.querySelector('[data-agent-box="credentials"]').textContent.includes('p4m_cs_'), 'The box never shows the secret');
		})
		.when('User revokes the credentials of the agent', async function () {
			await click('[data-btn="revoke-secret"]');
			await click('.agent-revoke-modal [data-btn="confirm-revoke"]');
			await settled();
		});
}
