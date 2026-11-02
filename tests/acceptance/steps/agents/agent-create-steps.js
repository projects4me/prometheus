/* global server */
import { click, currentURL, fillIn, settled } from '@ember/test-helpers';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

export default function (assert) {
	return steps(assert)
		.given('There is a role "$role" and a project "$project"', function (role, project) {
			server.create('role', { name: role });
			server.create('project', { name: project });
			assert.ok(true, `There is a role ${role} and a project ${project}`);
		})
		.given('Saving a project membership fails', function () {
			server.post('/membership', () => new Response(500, {}, { status: 'ERROR' }));
			assert.ok(true, 'Saving a project membership fails');
		})
		.when('User selects the role "$role" and the project "$project" for the agent', async function (role, project) {
			await selectChoose('[data-field="agent.roles"]', role);
			await selectChoose('[data-field="agent.projects"]', project);
			assert.ok(true, `User selected the role ${role} and the project ${project}`);
		})
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
		})
		.then('Agent "$name" has the role "$role" and is a member of "$project"', function (name, role, project) {
			let agent = server.schema.agents.findBy({ name });
			let roleId = server.schema.roles.findBy({ name: role }).id;
			let projectId = server.schema.projects.findBy({ name: project }).id;
			let membership = server.schema.memberships.findBy({ userId: agent.userId, projectId });
			assert.ok(server.schema.userroles.findBy({ userId: agent.userId, roleId }), `Agent ${name} has the role ${role}`);
			assert.ok(membership, `Agent ${name} is a member of ${project}`);
			assert.notEqual(membership.deleted, '0', 'The membership is not sent a deleted flag, a field Gaia does not have');
			assert.equal(server.schema.users.find(agent.userId).accountStatus, 'active', `Agent ${name} is active`);
		})
		.then('User sees the $type message "$message"', function (type, message) {
			let messages = Array.from(document.querySelectorAll(`.messenger-message.message-${type} .messenger-message-inner`));
			assert.ok(messages.some((el) => el.textContent.trim() === message), `User sees the ${type} message ${message}`);
		})
		.then('User is on the page of agent "$name"', function (name) {
			let agent = server.schema.agents.findBy({ name });
			assert.equal(currentURL(), `/app/agent/${agent.id}`, `User is on the page of agent ${name}`);
		});
}
