/* global server */
import steps from '../steps';
import agentFixtureSteps from './agent-fixtures';
import listToolbarSteps from '../common-steps/list-toolbar-steps';

const row = (name) => Array.from(document.querySelectorAll('[data-agent-id]')).find((el) => el.querySelector('[data-agent-field="name"]').textContent.trim() === name);
const text = (name, field) => row(name)?.querySelector(`[data-agent-field="${field}"]`).textContent.replace(/\s+/g, ' ').trim();

export default function (assert) {
	return listToolbarSteps(agentFixtureSteps(steps(assert)), assert, 'agent')
		.then('Agents list has $count agents', function (count) {
			assert.equal(document.querySelectorAll('[data-agent-id]').length, Number(count), `Agents list has ${count} agents`);
		})
		.then('Agent "$name" shows sponsor "$sponsor" and models "$models"', function (name, sponsor, models) {
			assert.equal(text(name, 'sponsor'), sponsor, `Agent ${name} shows sponsor ${sponsor}`);
			assert.equal(text(name, 'models'), models, `Agent ${name} shows models ${models}`);
		});
}
