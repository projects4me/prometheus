/* global server */
import { visit, settled, click } from '@ember/test-helpers';
import { Response } from 'miragejs';
import steps from '../steps';
import agentFixtureSteps from './agent-fixtures';

const field = (name) => document.querySelector(`[data-agent-field="${name}"]`)?.textContent.replace(/\s+/g, ' ').trim();

export default function (assert) {
	return agentFixtureSteps(steps(assert))
		.given('Agent "$name" has $count activities', function (name, count) {
			let agent = server.schema.agents.findBy({ name });
			server.createList('activity', Number(count), { createdUser: agent.userId, relatedTo: 'agent', relatedId: agent.id, type: 'updated' });
			assert.ok(true, `Agent ${name} has ${count} activities`);
		})
		.then('The Agent Activities box shows $count activities', function (count) {
			let box = document.querySelector('[data-agent-box="activities"]');

			assert.ok(box, 'The Agent Activities box is shown');
			assert.equal(box.querySelectorAll('[data-activity-block-type]').length, Number(count), 'activities in the box');
		})
		.given('The $status workflow "$name" triggers on $kind and runs the agent "$agent"', async function (status, name, kind, agent) {
			let record = server.schema.agents.findBy({ name: agent });
			let workflow = server.create('workflow', { name, status });
			server.create('workflownode', { workflowId: workflow.id, category: 'trigger', kind });
			let node = server.create('workflownode', { workflowId: workflow.id, category: 'actor', kind: 'run_agent', config: JSON.stringify({ agentId: record.id }) });
			server.create('workflowreference', { workflowId: workflow.id, nodeId: node.id, entityType: 'Agent', entityId: record.id });
		})
		.given('Gaia rejects an activity sort that carries its order', function () {
			// Gaia builds the ORDER BY from `sort` and `order`; a direction inside `sort` is a PHQL syntax error.
			server.get('/activity', (schema, request) => {
				let { sort, order } = request.queryParams;
				if (/\s/.test(sort ?? '')) {
					return new Response(404, { 'Content-Type': 'text/plain' }, 'PhalconException: Syntax error, unexpected token DESC');
				}
				if (sort !== 'Activity.dateCreated' || order !== 'DESC') {
					return new Response(400, {}, { errors: [{ status: '400', title: 'Unexpected activity sort' }] });
				}
				return schema.activities.all();
			});
		})
		.given('Gaia fails to load agents', function () {
			server.get('/agent', () => new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] }));
		})
		.given('Gaia fails to load user roles', function () {
			server.get('/userrole', () => new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] }));
		})
		.given('Gaia denies access to roles', function () {
			server.get('/role', () => new Response(403, {}, { error: 'Access denied to role' }));
		})
		.when('User opens the edit page of agent "$name"', async function (name) {
			let agent = server.schema.agents.findBy({ name });
			await visit(`/app/agent/edit/${agent.id}`);
			await settled();
			assert.ok(true, `User opened the edit page of ${name}`);
		})
		.then('The agent form is not shown', function () {
			assert.notOk(document.querySelector('[data-field="agent.name"]'), 'The agent form is not shown');
		})
		.when('User opens the $page page of an agent that does not exist', async function (page) {
			await visit(page === 'edit' ? '/app/agent/edit/no-such-agent' : '/app/agent/no-such-agent');
		})
		.then('The page not found error is shown', function () {
			assert.ok(document.querySelector('.error-page .headline.text-warning'), 'The 404 error page is shown');
			assert.notOk(document.querySelector('[data-agent-box="header"]'), 'No agent is shown');
		})
		.then('The server error is shown', function () {
			assert.ok(document.querySelector('.error-page .headline.text-red'), 'The 500 error page is shown');
			assert.notOk(document.querySelector('[data-agent-box="header"]'), 'No agent is shown');
		})
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
		.then('The workflows box lists "$name" as $place with trigger "$trigger" and status "$status"', function (name, place, trigger, status) {
			let row = Array.from(document.querySelectorAll('[data-agent-workflow]')).find((el) => el.querySelector('[data-agent-workflow-field="name"]').textContent.trim() === name);
			let text = (field) => row?.querySelector(`[data-agent-workflow-field="${field}"]`).textContent.replace(/\s+/g, ' ').trim();
			assert.ok(row, `The workflows box lists ${name}`);
			assert.equal(text('places'), place, 'referenced in');
			assert.equal(text('trigger'), trigger, 'trigger');
			assert.equal(text('status'), status, 'status');
		})
		.then('The workflows box says no workflow references the agent', function () {
			assert.ok(document.querySelector('[data-agent-workflow-field="none"]'), 'The workflows box says no workflow references the agent');
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
