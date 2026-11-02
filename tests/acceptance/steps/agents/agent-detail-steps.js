/* global server */
import { visit, settled } from '@ember/test-helpers';
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
		});
}
