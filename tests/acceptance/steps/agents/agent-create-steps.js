/* global server */
import { click, fillIn, settled } from '@ember/test-helpers';
import steps from '../steps';

export default function (assert) {
	return steps(assert)
		.when('User enters "$value" in agent name field', async function (value) {
			await fillIn('[data-field="agent.name"] input', value);
			assert.ok(true, `User entered ${value} in agent name field`);
		})
		.when('User enters "$value" in agent email field', async function (value) {
			await fillIn('[data-field="agent.email"] input', value);
			assert.ok(true, `User entered ${value} in agent email field`);
		})
		.when('User saves the agent', async function () {
			await click('[data-btn="save"]');
			await settled();
			assert.ok(true, 'User saved the agent');
		})
		.then('Agent "$name" is saved with the email "$email"', function (name, email) {
			let agent = server.schema.agents.findBy({ name });
			assert.ok(agent, `Agent ${name} is saved`);
			assert.equal(server.schema.users.find(agent.userId).email, email, `Agent ${name} has the email ${email}`);
		})
		.then('Agent "$name" has the model config simple "$simple", complex "$complex" and escalation "$escalation"', function (name, simple, complex, escalation) {
			let config = server.schema.agents.findBy({ name }).modelConfig;
			assert.deepEqual(config, { simple, complex, escalation }, 'The model config is saved');
		});
}
