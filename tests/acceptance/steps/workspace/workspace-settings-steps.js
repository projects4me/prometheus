import { Response } from 'miragejs';
import { click, currentURL, fillIn, visit, waitUntil } from '@ember/test-helpers';
import workspaceOverviewSteps from './workspace-overview-steps';

export default function (assert) {
    return workspaceOverviewSteps(assert)
        .given('Project "$name" exists outside workspace $code', async function (name, code) {
            let other = server.create('workspace', { name: `${name} workspace`, shortCode: `${name}`.toUpperCase().slice(0, 6) });
            server.create('project', { name, shortCode: name.toUpperCase().slice(0, 6), workspaceId: other.id });
            server.create('repository', { name: 'projects4me/loner', projectId: String(server.schema.projects.findBy({ name }).id) });
            assert.ok(true, `${name} is outside ${code}`);
        })
        .given('Gaia refuses to move projects with "$message"', async function (message) {
            server.patch('/project/:id', () => new Response(422, {}, { status: 'ERROR', messages: [message] }));
            assert.ok(true, 'Gaia refuses');
        })
        .when('User opens the Add project dialog', async function () {
            await click('[data-btn="add-project"]');
        })
        .when('User chooses the project "$name" in the Add project dialog', async function (name) {
            await click('.workspace-add-project-modal .ember-power-select-trigger');
            assert.dom('.workspace-add-project-modal').exists('dialog open');
            let option = [...document.querySelectorAll('.ember-power-select-option')].find((el) => el.textContent.includes(name));
            assert.ok(option, `option ${name} is listed`);
            await click(option);
        })
        .when('User confirms the Add project dialog', async function () {
            await click('.workspace-add-project-modal [data-btn="confirm-add-project"]');
        })
        .then('The Add project dialog shows the sharing and the environment', function () {
            assert.dom('[data-test-add-project-sharing]').exists('sharing table');
            assert.dom('[data-test-sharing-to-project] [data-test-user-chip]').exists('workspace members join the project');
            assert.dom('[data-test-add-project-repository]').includesText('projects4me/loner');
            assert.dom('[data-test-add-project-alone]').exists('alone hint');
        })
        .then('The Add project dialog shows the error "$message"', function (message) {
            assert.dom('[data-test-add-project-error]').hasText(message);
        })
        .given('The first project of workspace $code has $count runs in progress', async function (code, count) {
            let workspace = server.schema.workspaces.findBy({ shortCode: code });
            server.schema.projects.where({ workspaceId: workspace.id }).models[0].update({ runsInProgress: parseInt(count, 10) });
            assert.ok(true, `a project of ${code} has ${count} runs in progress`);
        })
        .when('User opens the Invite member dialog', async function () {
            await click('.workspace-members [data-btn="invite-member"]');
        })
        .when('User chooses the person "$name" in the Invite member dialog', async function (name) {
            await click('.workspace-invite-member-modal .ember-power-select-trigger');
            let option = [...document.querySelectorAll('.ember-power-select-option')].find((item) => item.textContent.includes(name));
            assert.ok(option, `option ${name} is listed`);
            await click(option);
        })
        .then('The Invite member dialog says they join all $count projects', function (count) {
            assert.dom('[data-test-invite-hint]').includesText(`all ${count} projects`);
        })
        .when('User confirms the Invite member dialog', async function () {
            await click('.workspace-invite-member-modal [data-btn="confirm-invite-member"]');
        })
        .then('The Members table lists "$name" once with $count of $total projects', function (name, count, total) {
            let rows = [...document.querySelectorAll('.workspace-members [data-member-id]')].filter((row) => row.textContent.includes(name));
            assert.equal(rows.length, 1, 'listed once');
            assert.dom('.workspace-members [data-test-member-projects]').includesText(`${count} of ${total}`);
            assert.dom('.workspace-invite-member-modal').doesNotExist('dialog closed');
        })
        .given('User $userId has $count open issues in workspace $code', async function (userId, count, code) {
            let workspace = server.schema.workspaces.findBy({ shortCode: code });
            let project = server.schema.projects.where({ workspaceId: workspace.id }).models[0];
            let open = server.create('issuestatus', { name: 'open', done: '0' });
            for (let i = 0; i < parseInt(count, 10); i++) {
                server.create('issue', { subject: `Open ${i}`, projectId: String(project.id), assignee: String(userId), statusId: String(open.id), issuestatus: open });
            }
            let finished = server.create('issuestatus', { name: 'finished', done: '1' });
            server.create('issue', { subject: 'Finished', projectId: String(project.id), assignee: String(userId), statusId: String(finished.id), issuestatus: finished });
            server.schema.projects.where({ workspaceId: workspace.id }).models.forEach((item) => {
                server.create('membership', { projectId: String(item.id), userId: String(userId) });
            });
            assert.ok(true, `User ${userId} has ${count} open issues`);
        })
        .when('User opens the Remove member dialog of "$name"', async function (name) {
            let row = [...document.querySelectorAll('.workspace-members tbody tr')].find((item) => item.textContent.includes(name));
            assert.ok(row, `${name} is listed`);
            await click(row.querySelector('[data-btn="remove-member"]'));
            await waitUntil(() => document.querySelector('[data-test-remove-summary]'));
        })
        .then('The Remove member dialog lists $count open issues', function (count) {
            assert.dom('[data-test-remove-issue]').exists({ count: parseInt(count, 10) });
        })
        .when('User chooses "$name" as the assignee of all issues in the Remove member dialog', async function (name) {
            await click('.workspace-remove-member-modal .ember-power-select-trigger');
            let option = [...document.querySelectorAll('.ember-power-select-option')].find((item) => item.textContent.includes(name));
            assert.ok(option, `option ${name} is listed`);
            await click(option);
            await click('.workspace-remove-member-modal [data-btn="apply-set-all"]');
        })
        .when('User confirms the Remove member dialog', async function () {
            await click('.workspace-remove-member-modal [data-btn="confirm-remove-member"]');
        })
        .then('The Members table no longer lists "$name"', async function (name) {
            await waitUntil(() => !document.querySelector('.workspace-remove-member-modal') || document.querySelector('[data-test-remove-error]'));
            assert.equal(document.querySelector('[data-test-remove-error]')?.textContent.trim() || '', '', 'no error shown');
            let rows = [...document.querySelectorAll('.workspace-members [data-member-id]')].filter((row) => row.textContent.includes(name));
            assert.equal(rows.length, 0, `${name} is gone`);
        })
        .then('User $userId has no memberships in workspace $code', function (userId, code) {
            let workspace = server.schema.workspaces.findBy({ shortCode: code });
            let projectIds = server.schema.projects.where({ workspaceId: workspace.id }).models.map((item) => String(item.id));
            let left = server.schema.memberships.where((item) => String(item.userId) === String(userId) && projectIds.includes(String(item.projectId)));
            assert.equal(left.models.length, 0, 'no memberships left');
        })
        .then('The open issues of workspace $code are assigned to User $userId', function (code, userId) {
            let open = server.schema.issues.where((item) => item.subject.startsWith('Open'));
            assert.equal(open.models.length, 2);
            open.models.forEach((issue) => assert.equal(String(issue.assignee), String(userId), 'handed over'));
        })
        .when('User opens the Move project out dialog of the first project', async function () {
            await click('.workspace-member-projects [data-btn="move-project"]');
        })
        .when('User confirms the Move project out dialog', async function () {
            await click('.workspace-move-project-modal [data-btn="confirm-move-project"]');
        })
        .then('The Move project out dialog warns of $count runs in progress', function (count) {
            assert.dom('[data-test-move-out-runs]').includesText(`${count} Talos run`);
            assert.dom('[data-test-move-out-facts] li').exists({ count: 3 });
        })
        .then('The Move project out dialog shows the error "$message"', function (message) {
            assert.dom('.workspace-move-project-modal').exists('dialog stays open');
            assert.dom('[data-test-move-out-error]').hasText(message);
        })
        .then('The Move project out dialog is closed', async function () {
            await waitUntil(() => !document.querySelector('.workspace-move-project-modal'), { timeout: 3000 }).catch(() => {});
            assert.dom('.workspace-move-project-modal').doesNotExist();
        })
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
        .given('Gaia refuses the workspace members with "$message"', async function (message) {
            server.get('/workspacemember', () => new Response(403, {}, { status: 'ERROR', error: message }));
            assert.ok(true, 'Gaia refuses the members');
        })
        .given('Gaia refuses the workspace projects with "$message"', async function (message) {
            server.get('/project', () => new Response(403, {}, { status: 'ERROR', error: message }));
            assert.ok(true, 'Gaia refuses the projects');
        })
        .then('The Members box shows the error "$message"', function (message) {
            assert.dom('.workspace-members [data-test-box-error]').includesText(message);
        })
        .then('The Member Projects box shows the error "$message"', function (message) {
            assert.dom('.workspace-member-projects [data-test-box-error]').includesText(message);
        })
        .then('The Members box lists $count rows', function (count) {
            assert.dom('.workspace-members [data-member-id]').exists({ count: parseInt(count, 10) });
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
