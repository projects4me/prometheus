import workspaceOverviewSteps from '../workspace/workspace-overview-steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
    const row = (code) => [...document.querySelectorAll('div.projects.project table tbody tr')]
        .find((tr) => tr.querySelector('td.project-name .project-code')?.textContent.trim() === code);

    return workspaceOverviewSteps(assert)
        .then('The projects list shows $count projects', async function (count) {
            let rows = document.querySelectorAll('div.projects.project table tbody tr[data-project-id]');
            assert.equal(rows.length, parseInt(count, 10), `${count} projects are listed`);
        })
        .then('The project $code shows workspace $name workspace', async function (code, name) {
            let cell = row(code)?.querySelector('td.project-workspace');
            assert.ok(cell?.textContent.includes(`${name} workspace`), `${code} shows ${name} workspace`);
        })
        .then('The project $code is flagged as only project', async function (code) {
            let cell = row(code)?.querySelector('td.project-workspace');
            assert.ok(cell?.querySelector('em'), `${code} is flagged as only project`);
        })
        .when('User filters the projects list by workspace $code', async function (code) {
            let name = server.schema.workspaces.findBy({ shortCode: code }).id;
            await click(`[data-workspace-filter="${name}"]`);
        });
}
