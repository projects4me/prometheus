/* global server */
import steps from '../steps';
import agentFixtureSteps from './agent-fixtures';
import listToolbarSteps from '../common-steps/list-toolbar-steps';

const row = (name) => Array.from(document.querySelectorAll('[data-test-data-table-row]')).find((el) => el.querySelector('[data-test-agent-name]').textContent.trim() === name);
const text = (name, column) => row(name)?.querySelector(`[data-test-data-table-cell="${column}"]`).textContent.replace(/\s+/g, ' ').trim();

export default function (assert) {
	return listToolbarSteps(agentFixtureSteps(steps(assert)), assert, 'agent', { dataTest: true })
		.then('Agents list has $count agents', function (count) {
			assert.equal(document.querySelectorAll('[data-test-data-table-row]').length, Number(count), `Agents list has ${count} agents`);
		})
		.then('The agents show 40px avatars', function () {
			const avatars = document.querySelectorAll('[data-test-data-table-row] [data-test-avatar]');
			assert.equal(avatars.length, 2, 'Each agent row has an AppUi::Avatar');
			avatars.forEach((a) => assert.equal(a.getAttribute('data-size'), 'm', 'Avatar is size m'));
		})
		.then('Agent "$name" shows sponsor "$sponsor" and models "$models"', function (name, sponsor, models) {
			assert.equal(text(name, 'sponsor'), sponsor, `Agent ${name} shows sponsor ${sponsor}`);
			assert.equal(text(name, 'models'), models, `Agent ${name} shows models ${models}`);
		});
}
