/* global server */
import steps from '../steps';
import agentFixtureSteps from '../agents/agent-fixtures';

const row = (name) => Array.from(document.querySelectorAll('[data-workflow-id]')).find((el) => el.querySelector('[data-workflow-field="name"]').textContent.trim() === name);
const text = (name, field) => row(name)?.querySelector(`[data-workflow-field="${field}"]`).textContent.replace(/\s+/g, ' ').trim();
const actors = (name) => Array.from(row(name)?.querySelectorAll('[data-workflow-actor]') ?? []);

function createWorkflow(name, status, kind, nodes) {
	let workflow = server.create('workflow', { name, status });
	server.create('workflownode', { workflowId: workflow.id, category: 'trigger', kind });
	nodes.forEach((node) => server.create('workflownode', { workflowId: workflow.id, ...node }));
}

export default function (assert) {
	return agentFixtureSteps(steps(assert))
		.given('The $status workflow "$name" triggers on $kind and runs the agent "$agent"', async function (status, name, kind, agent) {
			let record = server.schema.agents.findBy({ name: agent });
			createWorkflow(name, status, kind, [{ category: 'actor', kind: 'run_agent', config: JSON.stringify({ agentId: record.id }) }]);
		})
		.given('The $status workflow "$name" triggers on $kind and asks the user placeholder "$placeholder"', async function (status, name, kind, placeholder) {
			createWorkflow(name, status, kind, [{ category: 'actor', kind: 'ask_user', config: JSON.stringify({ userId: placeholder }) }]);
		})
		.given('The workflow "$name" ran $count times in the last week', async function (name, count) {
			let workflow = server.schema.workflows.findBy({ name });
			for (let i = 0; i < Number(count); i++) {
				server.create('workflowrun', { workflowId: workflow.id, dateCreated: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString() });
			}
		})
		.then('Workflows list has $count workflows', function (count) {
			assert.equal(document.querySelectorAll('[data-workflow-id]').length, Number(count), `Workflows list has ${count} workflows`);
		})
		.then('Workflow "$name" shows trigger "$trigger" and $runs runs', function (name, trigger, runs) {
			assert.equal(text(name, 'trigger'), trigger, `Workflow ${name} shows trigger ${trigger}`);
			assert.equal(text(name, 'runs'), runs, `Workflow ${name} shows ${runs} runs`);
		})
		.then('Workflow "$name" shows last run "$last"', function (name, last) {
			assert.equal(text(name, 'last-run'), last, `Workflow ${name} shows last run ${last}`);
		})
		.then('Workflow "$name" has the agent actor "$actor"', function (name, actor) {
			let found = actors(name).find((el) => el.textContent.includes(actor));
			assert.ok(found?.querySelector('[data-agent-badge]'), `Workflow ${name} marks agent ${actor} with the badge`);
		})
		.then('Workflow "$name" has the actor "$actor"', function (name, actor) {
			let found = actors(name).find((el) => el.textContent.replace(/\s+/g, ' ').trim() === actor);
			assert.ok(found && !found.querySelector('[data-agent-badge]'), `Workflow ${name} has the actor ${actor}`);
		});
}
