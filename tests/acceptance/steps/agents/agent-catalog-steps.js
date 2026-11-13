/* global server */
import { visit, click, fillIn, settled } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import steps from '../steps';
import agentFixtureSteps from './agent-fixtures';

const clean = (el) => el?.textContent.replace(/\s+/g, ' ').trim();
const byAttribute = (attribute, value) => Array.from(document.querySelectorAll(`[${attribute}]`)).find((el) => el.getAttribute(attribute) === value);

export default function (assert) {
	return agentFixtureSteps(steps(assert))
		.given('Tool server "$server" has the tool "$tool" granted to "$agent" with the rule "$rule"', async function (serverName, toolName, agentName, rule) {
			let toolServer = server.create('toolserver', { name: serverName, kind: 'mcp', location: 'ares', endpoint: 'https://ares.local/mcp' });
			let tool = server.create('tool', { name: toolName, toolServerId: toolServer.id, inputSchema: '{"properties":{"issue_number":{}}}' });
			let agent = server.schema.agents.findBy({ name: agentName });

			server.create('agenttool', { agentId: agent.id, toolId: tool.id, permissionRule: rule });
		})
		.given('Skill "$name" version "$version" is granted to "$agent"', async function (name, version, agentName) {
			let skill = server.create('skill', { name, version, description: `${name} skill`, content: '# Steps' });
			let agent = server.schema.agents.findBy({ name: agentName });

			server.create('agentskill', { agentId: agent.id, skillId: skill.id });
		})
		.when('User opens the tool catalog', async function () {
			await visit('/app/agent/tools');
			await settled();
			assert.ok(true, 'User opened the tool catalog');
		})
		.when('User selects the tool server "$server" and the tool "$tool"', async function (serverName, toolName) {
			await click(`[data-server="${serverName}"] [data-btn="select-server"]`);
			await click(`[data-tool="${toolName}"] [data-btn="select-tool"]`);
			assert.ok(true, `User selected ${serverName} and ${toolName}`);
		})
		.when('User grants the selected tool to "$agent" with the rule "$rule"', async function (agentName, rule) {
			await selectChoose('[data-field="agenttool.agentId"]', agentName);
			await fillIn('[data-field="agenttool.newRule"] input', rule);
			await click('[data-catalog-form="grant"] [data-btn="add-grant"]');
			assert.ok(true, `User granted the tool to ${agentName}`);
		})
		.when('User opens the page of agent "$name"', async function (name) {
			await visit(`/app/agent/${server.schema.agents.findBy({ name }).id}`);
			await settled();
			assert.ok(true, `User opened the page of ${name}`);
		})
		.when('User opens the skills screen and selects the skill "$skill"', async function (skill) {
			await visit('/app/agent/skills');
			await click(`[data-skill="${skill}"] [data-btn="select-skill"]`);
			assert.ok(true, `User selected the skill ${skill}`);
		})
		.when('User grants the selected skill to "$agent"', async function (agentName) {
			await selectChoose('[data-field="agentskill.agentId"]', agentName);
			await click('[data-catalog-box="skill-grants"] [data-btn="add-grant"]');
			assert.ok(true, `User granted the skill to ${agentName}`);
		})
		.then('Tool server "$server" shows $tools tools and $agents agents', function (serverName, tools, agents) {
			let row = byAttribute('data-server', serverName);

			assert.equal(clean(row.querySelector('[data-cell="tools"]')), tools, 'tool count');
			assert.equal(clean(row.querySelector('[data-cell="agents"]')), agents, 'agent count');
		})
		.then('The tool "$tool" is granted to "$agents"', function (toolName, agents) {
			let row = byAttribute('data-tool', toolName);

			assert.equal(clean(row.querySelector('[data-cell="granted-to"]')), agents, `${toolName} is granted to ${agents}`);
		})
		.then('The agent detail lists the tool "$tool" and the skill "$skill"', function (tool, skill) {
			assert.ok(byAttribute('data-agent-tool', tool), `The agent detail lists the tool ${tool}`);
			assert.ok(byAttribute('data-agent-skill', skill), `The agent detail lists the skill ${skill}`);
		})
		.then('The skill "$skill" is used by $count agents', function (skill, count) {
			assert.equal(document.querySelectorAll('[data-catalog-box="skill-grants"] .agent-grant').length, Number(count), 'agents of the skill');
			assert.ok(clean(byAttribute('data-skill', skill)).includes(`${count} agents`), `${skill} counts ${count} agents`);
		});
}
