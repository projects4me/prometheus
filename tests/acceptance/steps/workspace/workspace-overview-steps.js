import { click } from '@ember/test-helpers';
import { Response } from 'miragejs';
import steps from '../steps';

// The requests Mirage handled, recorded by the Given step of the paged Overview
let projectRequests = [];
let membershipRequests = [];

/**
 * The table row of a project of the workspace, found by its short code
 */
function findProjectRow(code, number) {
    let link = [...document.querySelectorAll('.workspace-projects [data-test-data-table-row]')].find((row) => row.textContent.includes(`(${code}P${number})`));
    return link || null;
}

export default function (assert) {
    return steps(assert)
        .given(
            'The membership requests are recorded',
            async function () {
                membershipRequests = [];
                server.pretender.handledRequest = (verb, path) => {
                    if (verb === 'GET' && /\/workspacemember\?/.test(path)) {
                        membershipRequests.push(path);
                    }
                };
                assert.ok(true, 'membership requests are recorded');
            }
        )
        .given(
            'Workspace $code exists with $count projects',
            async function (code, count) {
                let workspace = server.create('workspace', {
                    name: `${code} workspace`,
                    shortCode: code,
                    projectCount: parseInt(count, 10),
                    createdBy: server.schema.users.find(1)
                });
                for (let i = 1; i <= parseInt(count, 10); i++) {
                    server.create('project', {
                        name: `${code} project ${i}`,
                        shortCode: `${code}P${i}`,
                        workspaceId: workspace.id
                    });
                }
                assert.ok(true, `Workspace ${code} exists with ${count} projects`);
            }
        )
        .given(
            'Workspace $code has environment facts with runtime "$name" $state',
            async function (code, name, state) {
                let runtime = server.create('serviceclient', { name });
                server.schema.workspaces.findBy({ shortCode: code }).update({
                    runtime,
                    runtimeOnline: state === 'online',
                    crossProjectLinkCount: 14,
                    crossProjectBlockingCount: 3,
                    runsInProgress: 2,
                    repositoryCount: 5,
                    projectRepositoryCount: 3,
                    agentCount: 4,
                    toolserverCount: 6,
                    skillCount: 7
                });
                assert.ok(true, `Workspace ${code} has runtime ${name} ${state}`);
            }
        )
        .given(
            'Workspace $code has $count activities',
            async function (code, count) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                for (let i = 1; i <= parseInt(count, 10); i++) {
                    server.create('activity', {
                        relatedTo: 'workspace',
                        relatedId: workspace.id,
                        type: 'related',
                        description: `Project ${i} added`,
                        dateCreated: `2026-01-${String(i).padStart(2, '0')} 10:00:00`
                    });
                }
                assert.ok(true, `Workspace ${code} has ${count} activities`);
            }
        )
        .given(
            'Workspace $code requests are recorded',
            async function (code) {
                projectRequests = [];
                server.pretender.handledRequest = (verb, path, request) => projectRequests.push(request);
                assert.ok(true, `Requests are recorded for ${code}`);
            }
        )
        .given(
            'User $userId is a member of $count projects of workspace $code',
            async function (userId, count, code) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                server.create('workspacemember', {
                    workspaceId: String(workspace.id),
                    userId: String(userId),
                    projectCount: parseInt(count, 10),
                    user: server.schema.users.find(userId)
                });
                assert.ok(true, `User ${userId} is a member of ${count} projects`);
            }
        )
        .given(
            'Workspace $code has $count more members',
            async function (code, count) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                for (let i = 0; i < parseInt(count, 10); i++) {
                    let user = server.create('user', { name: `${code} person ${i}` });
                    server.create('workspacemember', { workspaceId: String(workspace.id), userId: String(user.id), projectCount: 1, user });
                }
                assert.ok(true, `${count} more members`);
            }
        )
        .given(
            'Gaia refuses to delete workspace $code with "$message"',
            async function (code, message) {
                server.delete('/workspace/:id', () => new Response(422, {}, { status: 'ERROR', messages: [message] }));
                assert.ok(true, `Gaia refuses to delete workspace ${code}`);
            }
        )
        .given(
            'User_$userId selects the first project of workspace $code',
            async function (userId, code) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                let project = server.schema.projects.where({ workspaceId: workspace.id }).models[0];
                server.create('membership', {
                    projectId: String(project.id),
                    userId: String(userId),
                    user: server.schema.users.find(userId)
                });
                window.localStorage.setItem('selectedProject', project.shortCode);
                assert.ok(true, `User ${userId} selects ${project.shortCode}`);
            }
        )
        .when(
            'User opens the project workspace link',
            async function () {
                await click('[data-test-project-workspace-link]');
            }
        )
        .then(
            'The project shows workspace $code as a link',
            async function (code) {
                assert.dom('.project-details [data-test-project-workspace-link]').hasText(`${code} workspace`, 'The workspace name is a link');
            }
        )
        .then(
            'The workspace page header links to workspace $code',
            async function (code) {
                assert.dom('.content-header h1 small a').exists('The workspace name is the header link');
                assert.dom('.content-header .breadcrumb').exists('The breadcrumb is shown');
                assert.dom('.workspace-details .workspace-shortcode').hasText(`(${code})`, 'The header box shows the code');
            }
        )
        .then(
            'The workspace breadcrumb ends with "$label"',
            async function (label) {
                assert.dom('.content-header .breadcrumb li:nth-child(2)').includesText('Workspaces', 'The trail goes through Workspaces');
                assert.dom('.content-header .breadcrumb li:last-child').includesText(label, 'The trail ends with the workspace');
            }
        )
        .then(
            'The workspace facts show $count projects',
            async function (count) {
                assert.dom('.workspace-details .workspace-project-count').hasText(String(count), 'The projects fact matches');
                assert.dom('.workspace-details .workspace-member-count').exists('The members fact is shown');
            }
        )
        .then(
            'The workspace has a Settings button and no delete button',
            async function () {
                assert.dom('.workspace-details [data-btn="settings"]').hasText('Settings', 'Settings is translated');
                assert.dom('[data-btn="delete"]').doesNotExist('Delete moved to Settings');
            }
        )
        .given(
            'Project $number of workspace $code has $issues open issues, milestone "$milestone", repository "$repository" and manager User $userId',
            async function (number, code, issues, milestone, repository, userId) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                let project = server.schema.projects.findBy({ workspaceId: workspace.id, shortCode: `${code}P${number}` });
                project.update({
                    openIssueCount: parseInt(issues, 10),
                    activeMilestoneName: milestone || null,
                    activeMilestoneId: milestone ? '1' : null,
                    manager: server.schema.users.find(userId)
                });
                server.create('repository', { name: repository, projectId: String(project.id), workspaceId: String(workspace.id) });
                assert.ok(true, `Project ${number} of ${code} is set up`);
            }
        )
        .then(
            'Project $number of workspace $code shows $issues open issues, milestone "$milestone", repository "$repository" and a manager',
            async function (number, code, issues, milestone, repository) {
                let row = `[data-test-data-table-row] [data-project-id]`;
                let cell = findProjectRow(code, number);
                assert.dom(cell.querySelector('[data-test-project-open-issues]')).hasText(String(issues), 'Open issues');
                assert.dom(cell.querySelector('[data-test-project-milestone]')).hasText(milestone || '–', 'Active milestone');
                assert.dom(cell.querySelector('[data-test-project-repository]')).hasText(repository, 'Repository');
                assert.dom(cell.querySelector('[data-test-project-manager] a')).exists('Manager link');
                assert.ok(row);
            }
        )
        .then(
            'Project $number of workspace $code shows no milestone, no repository and no manager',
            async function (number, code) {
                let cell = findProjectRow(code, number);
                assert.dom(cell.querySelector('[data-test-project-milestone]')).hasText('–', 'No milestone');
                assert.dom(cell.querySelector('[data-test-project-repository]')).hasText('–', 'No repository');
                assert.dom(cell.querySelector('[data-test-project-manager]')).hasText('–', 'No manager');
            }
        )
        .then(
            'Project $number of workspace $code is not listed',
            async function (number, code) {
                assert.notOk(findProjectRow(code, number), 'The project is on another page');
            }
        )
        .then(
            'The repositories of workspace $code were requested once with a limit of $limit and no OR',
            async function (code, limit) {
                let requests = projectRequests.filter((request) => request.url.includes('/repository?'));
                assert.equal(requests.length, 1, 'One repository request');
                let query = decodeURIComponent(requests[0].queryParams.query);
                assert.ok(/Repository\.projectId CONTAINS /.test(query), 'The query uses CONTAINS');
                assert.notOk(/ OR /.test(query), 'The query has no OR');
                assert.equal(requests[0].queryParams.limit, limit, 'The request is limited');
            }
        )
        .then(
            'The workspace header shows $code',
            async function (code) {
                assert.dom('.workspace-details .workspace-shortcode').hasText(`(${code})`, `The header shows ${code}`);
                assert.dom('.workspace-details .workspace-creator .users-list-name').exists('The creator is shown');
            }
        )
        .then(
            'The workspace lists $count projects',
            async function (count) {
                assert.dom('.workspace-projects [data-project-id]').exists({ count: parseInt(count, 10) }, `${count} projects are listed`);
            }
        )
        .then(
            'The projects of workspace $code were requested with a limit of $limit',
            async function (code, limit) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                let requests = projectRequests.filter((request) => {
                    return request.url.includes('/project?') && decodeURIComponent(request.url).includes(`Project.workspaceId : ${workspace.id}`);
                });
                assert.ok(requests.length > 0, 'The projects were requested');
                requests.forEach((request) => {
                    assert.equal(request.queryParams.limit, limit, 'The request has a finite limit');
                    assert.equal(request.queryParams.sort, 'Project.name', 'The request is sorted by name');
                });
            }
        )
        .when(
            'User moves the projects pager to the next page',
            async function () {
                await click('.workspace-projects [data-test-pager-next]');
            }
        )
        .then(
            'The projects pager shows "$text"',
            async function (text) {
                assert.dom('.workspace-projects [data-test-pager-range]').includesText(text);
            }
        )
        .when(
            'User loads more workspace activities',
            async function () {
                await click('.workspace-activities [data-test-activities-more] button');
            }
        )
        .then(
            'The Workspace Activities box lists $count activities',
            async function (count) {
                assert.dom('.workspace-activities li[data-activity-block-type]').exists({ count: parseInt(count, 10) }, `${count} activities are listed`);
            }
        )
        .then(
            'The Workspace Activities box shows the empty state',
            async function () {
                assert.dom('.workspace-activities [data-test-empty-state]').exists('the empty state is shown');
            }
        )
        .then(
            'The workspace lists $count members',
            async function (count) {
                assert.dom('.workspace-members li[data-member-id]').exists({ count: parseInt(count, 10) }, `${count} members are listed`);
            }
        )
        .then(
            'The workspace members were requested through workspacemember with a limit of 20 and no OR',
            async function () {
                assert.ok(membershipRequests.length >= 1, 'A workspacemember request');
                let params = new URL(membershipRequests[0], window.location.origin).searchParams;
                assert.ok(/Workspacemember\.workspaceId : /.test(params.get('query')), 'The query filters on workspaceId');
                assert.notOk(/ OR /.test(params.get('query')), 'The query has no OR');
                assert.equal(params.get('limit'), '20', 'The request is paged');
            }
        )
        .when(
            'User moves the members pager to the next page',
            async function () {
                await click('[data-members-pagination] [data-test-pager-next]');
            }
        )
        .then(
            'The workspace members box links Manage members to the Settings page of workspace $code',
            async function (code) {
                assert.ok(document.querySelector('.workspace-members [data-test-manage-members]').getAttribute('href').endsWith(`/edit/${code}`), 'Manage members opens the Settings page');
            }
        )
        .then(
            'The workspace is not found',
            async function () {
                assert.dom('.workspace-details').doesNotExist('The not-found state replaces the page');
            }
        )
        .then(
            'The workspace header shows $links cross-project links, $blocking blocking, and "$text" with a green dot',
            async function (links, blocking, text) {
                assert.dom('[data-test-cross-project-links]').hasText(links, 'The link count is shown');
                assert.dom('[data-test-cross-project-blocking]').hasText(`(${blocking} blocking)`, 'The blocking count is shown');
                assert.dom('[data-test-environment-fact]').includesText(text, 'The runtime status is shown');
                assert.dom('[data-test-environment-dot]').hasClass('text-green', 'The dot is green');
            }
        )
        .then(
            'The workspace header shows "$text" with a grey dot',
            async function (text) {
                assert.dom('[data-test-environment-fact]').includesText(text, 'The runtime status is shown');
                assert.dom('[data-test-environment-dot]').hasClass('text-muted', 'The dot is grey');
            }
        )
        .then(
            'The workspace header shows "No runtime bound"',
            async function () {
                assert.dom('[data-test-environment-fact]').includesText('No runtime bound', 'No runtime is shown');
                assert.dom('[data-test-environment-dot]').doesNotExist('There is no dot');
                assert.dom('[data-test-env-runtime]').includesText('No runtime bound', 'The box shows no runtime');
            }
        )
        .then(
            'The Environment box shows runtime "$name" with a green dot, $runs runs, "$repos" repositories, $agents agents, $tools tool servers and $skills skills',
            async function (name, runs, repos, agents, tools, skills) {
                assert.dom('[data-test-env-runtime]').includesText(name, 'The runtime name is shown');
                assert.dom('[data-test-env-dot]').hasClass('text-green', 'The dot is green');
                assert.dom('[data-test-env-runs]').hasText(runs, 'Runs in progress');
                assert.dom('[data-test-env-repositories]').hasText(repos, 'Repositories');
                assert.dom('[data-test-env-agents]').hasText(agents, 'Agents');
                assert.dom('[data-test-env-toolservers]').hasText(tools, 'Tool servers');
                assert.dom('[data-test-env-skills]').hasText(skills, 'Skills');
            }
        )
        .then(
            'The Environment box shows runtime "$name" with a grey dot',
            async function (name) {
                assert.dom('[data-test-env-runtime]').includesText(name, 'The runtime name is shown');
                assert.dom('[data-test-env-dot]').hasClass('text-muted', 'The dot is grey');
            }
        )
        .then(
            'The Environment box links Agents to the agents list',
            async function () {
                assert.dom('[data-test-env-link-agents]').hasAttribute('href', /\/agent$/, 'Agents link goes to the agents list');
                assert.dom('[data-test-env-link-environment]').exists('The Environment link is shown');
            }
        );
}
