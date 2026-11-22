import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import workspaceOverviewSteps from './workspace-overview-steps';

export default function (assert) {
    return workspaceOverviewSteps(assert)
        .when('User visits $path', async function (path) {
            await visit(`/${path}`);
        })
        .when('User renames the workspace in Settings to "$name"', async function (name) {
            await fillIn('[data-field="workspace.name"] input', name);
        })
        .when('User confirms deleting the workspace in Settings', async function () {
            await click('.workspace-settings-delete [data-btn="delete"]');
            await click('.workspace-delete-modal [data-btn="confirm-delete"]');
        })
        .when('User saves the workspace details in Settings', async function () {
            await click('[data-btn="save"]');
        })
        .then('Workspace "$name" with code "$code" is stored', function (name, code) {
            let workspace = server.schema.workspaces.findBy({ shortCode: code });
            assert.ok(workspace, 'workspace exists');
            assert.equal(workspace.name, name, 'name stored');
        })
        .then('The workspace settings show the tabs "$tabs"',function (tabs) {
            let shown = [...document.querySelectorAll('.workspace-settings [data-tab]')].map((tab) => tab.dataset.tab);
            assert.deepEqual(shown, tabs.split(', '), 'the four tabs are shown');
        })
        .then('The workspace settings Projects tab is open', function () {
            assert.dom('.workspace-settings [data-tab="projects"]').exists();
            assert.dom('.workspace-settings .nav-tabs li.active [data-tab="projects"]').exists('Projects tab is active');
            assert.dom('.workspace-details-form').exists('details form is shown');
        })
        .given('Workspace $code has repositories "$a" on "$ab" and "$b" on "$bb"', async function (code, a, ab, b, bb) {
            let workspace = server.schema.workspaces.findBy({ shortCode: code });
            let project = server.schema.projects.where({ workspaceId: workspace.id }).models[0];
            server.create('repository', { name: a, url: `git@example.com:${a}.git`, baseBranch: ab, workspaceId: String(workspace.id), projectId: String(project.id) });
            server.create('repository', { name: b, url: `git@example.com:${b}.git`, baseBranch: bb, workspaceId: String(workspace.id) });
            assert.ok(true, 'repositories created');
        })
        .then('The Environment tab shows runtime "$name" online and $count repositories with base branches', function (name, count) {
            assert.dom('.workspace-environment-runtime [data-test-environment-runtime]').includesText(name);
            assert.dom('.workspace-environment-runtime [data-test-environment-dot].text-green').exists();
            assert.dom('.workspace-environment-repositories [data-repository-id]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-environment-repositories [data-test-repository-branch]').exists({ count: parseInt(count, 10) });
            let projects = [...document.querySelectorAll('.workspace-environment-repositories [data-test-repository-project]')].map((cell) => cell.textContent.trim());
            assert.deepEqual(projects, ['ENG project 1', 'Workspace'], 'the project, or Workspace when there is none');
        })
        .then('The Member Projects table lists $count projects with the four columns', function (count) {
            assert.dom('.workspace-member-projects [data-project-id]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-member-projects th').exists({ count: 5 }, 'four data columns and the action column');
            assert.dom('.workspace-member-projects [data-test-project-open-issues]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-member-projects [data-test-project-runs]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-member-projects [data-btn="move-project"]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-member-projects [data-btn="add-project"]').exists();
        })
        .then('The Members table lists $count person with the sharing callout for $projects projects', function (count, projects) {
            assert.dom('.workspace-members [data-member-id]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-members [data-members-callout]').includesText(`all ${projects} projects`);
            assert.dom('.workspace-members [data-test-member-projects]').includesText(`2 of ${projects}`);
            assert.dom('.workspace-members [data-test-member-type]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-members [data-btn="remove-member"]').exists({ count: parseInt(count, 10) });
            assert.dom('.workspace-members [data-btn="invite-member"]').exists();
        })
        .then('The Who Can Manage box lists the workspace permissions', function () {
            let text = document.querySelector('.workspace-who-can-manage').textContent;
            ['workspace.update', 'membership.create', 'membership.delete', 'project.update', 'agent.*'].forEach((permission) => {
                assert.ok(text.includes(permission), permission);
            });
        })
        .then('The Agents tab links to agents, workflows, tools and skills', function () {
            ['agents', 'workflows', 'tools', 'skills'].forEach((name) => {
                assert.dom(`[data-agents-link="${name}"]`).exists(name);
            });
        })
        .then('Workspace $code is deleted and the workspaces list is shown', function (code) {
            assert.notOk(server.schema.workspaces.findBy({ shortCode: code }), `Workspace ${code} is deleted`);
            assert.ok(/^\/app\/workspace(\?|$)/.test(currentURL()), 'The workspaces list is shown');
        })
        .then('The workspace settings delete button is disabled', function () {
            assert.dom('.workspace-settings-delete [data-btn="delete"]').isDisabled('Delete is disabled');
        });
}
