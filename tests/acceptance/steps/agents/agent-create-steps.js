/* global server */
import { click, currentURL, fillIn, find, findAll, settled, visit } from '@ember/test-helpers';
import { Response } from 'miragejs';
import { clickTrigger, removeMultipleOption, selectChoose, selectSearch } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

const FIELDS = { scopes: '[data-field="agent.delegationScopes"]', projects: '[data-field="agent.projects"]', roles: '[data-field="agent.roles"]' };

const names = (list) => list.split(',').map((name) => name.trim());

const texts = (selector) => findAll(selector).map((element) => element.textContent.trim());

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
		.given('Projects "$items" exist', function (list) {
			names(list).forEach((name) => server.create('project', { name }));
			assert.ok(true, `Projects ${list} exist`);
		})
		.given('Roles "$items" exist', function (list) {
			names(list).forEach((name) => server.create('role', { name }));
			assert.ok(true, `Roles ${list} exist`);
		})
		.then('The agent $field list shows "$items" in that order', async function (field, list) {
			if (find(`${FIELDS[field]} .ember-power-select-trigger`).getAttribute('aria-expanded') !== 'true') {
				await clickTrigger(FIELDS[field]);
			}
			assert.deepEqual(texts('.ember-power-select-option'), names(list), `The ${field} list shows ${list}`);
		})
		.when('User searches "$query" in the agent $field field', async function (query, field) {
			await selectSearch(FIELDS[field], query);
			assert.ok(true, `User searched ${query} in the ${field} field`);
		})
		.when('User picks "$name" in the agent $field field', async function (name, field) {
			await selectChoose(FIELDS[field], name);
			assert.ok(true, `User picked ${name} in the ${field} field`);
		})
		.when('User removes "$name" from the agent $field field', async function (name, field) {
			await removeMultipleOption(FIELDS[field], name);
			assert.ok(true, `User removed ${name} from the ${field} field`);
		})
		.then('The agent $field field shows "$items"', function (field, list) {
			let picked = texts(`${FIELDS[field]} .ember-power-select-multiple-option`).map((text) => text.replace('×', '').trim());
			assert.deepEqual(picked, names(list), `The ${field} field shows ${list}`);
		})
		.when('User enters "$value" in agent name field', async function (value) {
			await fillIn('[data-field="agent.name"] input', value);
			assert.ok(true, `User entered ${value} in agent name field`);
		})
		.when('User enters "$value" in agent email field', async function (value) {
			await fillIn('[data-field="agent.email"] input', value);
			assert.ok(true, `User entered ${value} in agent email field`);
		})
		.when('User opens the edit page of agent "$name"', async function (name) {
			await visit(`/app/agent/edit/${server.schema.agents.findBy({ name }).id}`);
			await settled();
			assert.ok(true, `User opened the edit page of ${name}`);
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
		.when('User types the scope "$scope" in the agent scopes field', async function (scope) {
			await selectSearch(FIELDS.scopes, scope);
			await selectChoose(FIELDS.scopes, scope);
			assert.ok(true, `User typed the scope ${scope}`);
		})
		.then('Agent "$name" has the delegation scopes "$items"', function (name, list) {
			let scopes = server.schema.agents.findBy({ name }).delegationScopes;
			assert.deepEqual(scopes, names(list), `Agent ${name} has the delegation scopes ${list}`);
		})
		.then('The agent page shows the delegation scopes "$items"', function (list) {
			assert.equal(find('[data-agent-field="delegation-scopes"]').textContent.trim(), list, 'The page shows the scopes');
		})
		.then('The agent page shows "$text" as its delegation scopes', function (text) {
			assert.equal(find('[data-agent-field="delegation-scopes"]').textContent.trim(), text, 'The page shows the text');
		})
		.then('User sees the $type message "$message"', function (type, message) {
			let messages = Array.from(document.querySelectorAll(`.messenger-message.message-${type} .messenger-message-inner`));
			assert.ok(messages.some((el) => el.textContent.trim() === message), `User sees the ${type} message ${message}`);
		})
		.then('User is on the page of agent "$name"', function (name) {
			let agent = server.schema.agents.findBy({ name });
			assert.equal(currentURL(), `/app/agent/${agent.id}`, `User is on the page of agent ${name}`);
		})
		.then('Agent "$name" is a member of the projects "$items"', function (name, list) {
			let userId = server.schema.agents.findBy({ name }).userId;
			let projects = server.schema.memberships.where({ userId }).models.map((membership) => server.schema.projects.find(membership.projectId).name);
			assert.deepEqual(projects.sort(), names(list), `Agent ${name} is a member of ${list}`);
		})
		.then('Agent "$name" has the roles "$items"', function (name, list) {
			let userId = server.schema.agents.findBy({ name }).userId;
			let roles = server.schema.userroles.where({ userId }).models.map((userrole) => server.schema.roles.find(userrole.roleId).name);
			assert.deepEqual(roles.sort(), names(list), `Agent ${name} has the roles ${list}`);
		});
}
