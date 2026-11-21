import { click, currentURL } from '@ember/test-helpers';
import { Response } from 'miragejs';
import steps from '../steps';

export default function (assert) {
    return steps(assert)
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
            'User $userId is a member of both projects of workspace $code',
            async function (userId, code) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                server.schema.projects.where({ workspaceId: workspace.id }).models.forEach((project) => {
                    server.create('membership', {
                        projectId: String(project.id),
                        userId: String(userId),
                        user: server.schema.users.find(userId)
                    });
                });
                assert.ok(true, `User ${userId} is a member of both projects`);
            }
        )
        .given(
            'User $userId is a member of the first project of workspace $code',
            async function (userId, code) {
                let workspace = server.schema.workspaces.findBy({ shortCode: code });
                let project = server.schema.projects.where({ workspaceId: workspace.id }).models[0];
                server.create('membership', {
                    projectId: String(project.id),
                    userId: String(userId),
                    user: server.schema.users.find(userId)
                });
                assert.ok(true, `User ${userId} is a member of the first project`);
            }
        )
        .given(
            'Gaia refuses to delete workspace $code with "$message"',
            async function (code, message) {
                server.delete('/workspace/:id', () => new Response(422, {}, { status: 'ERROR', messages: [message] }));
                assert.ok(true, `Gaia refuses to delete workspace ${code}`);
            }
        )
        .when(
            'User confirms deleting the workspace',
            async function () {
                await click('.workspace-details [data-btn="delete"]');
                await click('.workspace-delete-modal [data-btn="confirm-delete"]');
            }
        )
        .then(
            'The workspace delete button is disabled',
            async function () {
                assert.dom('.workspace-details [data-btn="delete"]').isDisabled('Delete is disabled');
            }
        )
        .then(
            'Workspace $code is deleted and the workspaces list is shown',
            async function (code) {
                assert.notOk(server.schema.workspaces.findBy({ shortCode: code }), `Workspace ${code} is deleted`);
                assert.ok(/^\/app\/workspace(\?|$)/.test(currentURL()), 'The workspaces list is shown');
            }
        )
        .then(
            'The workspace delete refusal shows "$message"',
            async function (message) {
                assert.dom('[data-delete-error]').hasText(message, 'Gaia message is shown');
                assert.ok(currentURL().startsWith('/app/workspace/'), 'The page is kept');
                assert.ok(server.schema.workspaces.first(), 'The workspace is kept');
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
                assert.dom('.workspace-projects li[data-project-id]').exists({ count: parseInt(count, 10) }, `${count} projects are listed`);
            }
        )
        .then(
            'The workspace lists $count members',
            async function (count) {
                assert.dom('.workspace-members li[data-member-id]').exists({ count: parseInt(count, 10) }, `${count} members are listed`);
            }
        )
        .then(
            'The workspace is not found',
            async function () {
                assert.dom('.workspace-details').doesNotExist('The not-found state replaces the page');
            }
        );
}
