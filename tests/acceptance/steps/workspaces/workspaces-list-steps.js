import { click, settled } from '@ember/test-helpers';
import steps from '../steps';

const rows = () => Array.from(document.querySelectorAll('[data-test-data-table-row]'));
const row = (name) => rows().find((el) => el.querySelector('[data-test-workspace-name]').textContent.trim() === name);
const cell = (name, column) => row(name).querySelector(`[data-test-data-table-cell="${column}"]`).textContent.trim();

export default function (assert) {
	return steps(assert)
		.given('Workspace "$name" with code "$code" has $projects projects and $members members', function (name, code, projects, members) {
			server.create('workspace', { name, shortCode: code, projectCount: Number(projects), memberCount: Number(members) });
		})
		.when('User searches the list for "$query"', async function (query) {
			this.owner.lookup('controller:app.workspaces.index').set('query', query);
			await settled();
		})
		.when('User sorts the workspaces by "$label"', async function (label) {
			let header = Array.from(document.querySelectorAll('th')).find((th) => th.textContent.trim() === label);
			await click(header.querySelector('button, a') || header);
		})
		.then('Workspaces list has $count workspaces', function (count) {
			assert.equal(rows().length, Number(count), `Workspaces list has ${count} workspaces`);
		})
		.then('Workspace "$name" shows code "$code", $projects projects and $members members', function (name, code, projects, members) {
			assert.equal(cell(name, 'shortCode'), code, 'short code');
			assert.equal(cell(name, 'projectCount'), projects, 'projects');
			assert.equal(cell(name, 'memberCount'), members, 'members');
		})
		.then('Workspaces list shows the columns "$labels"', function (labels) {
			let headers = Array.from(document.querySelectorAll('thead th')).map((th) => th.textContent.trim()).filter(Boolean);
			assert.deepEqual(headers, labels.split(',').map((l) => l.trim()), 'column headers');
		})
		.then('The workspaces are listed in the order "$names"', function (names) {
			let shown = rows().map((el) => el.querySelector('[data-test-workspace-name]').textContent.trim());
			assert.deepEqual(shown, names.split(',').map((n) => n.trim()), 'row order');
		})
		.then('The workspaces list says "$message"', function (message) {
			assert.ok(document.querySelector('.content').textContent.includes(message), message);
		});
}
