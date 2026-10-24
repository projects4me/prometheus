import { click, fillIn, visit } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
        {
            "The idea $title is open in the project": (assert, ctx) => async function (title) {
                let project = ctx.get('currentProject');
                server.create('idea', { projectId: project.id, title, status: 'open' });
                assert.ok(true, `The idea ${title} exists`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens the idea $title": (assert, ctx) => async function (title) {
                let project = ctx.get('currentProject');
                let idea = server.schema.ideas.findBy({ title });
                await visit(`/app/project/${project.shortCode}/idea/${idea.id}`);
                assert.ok(true, `User opens the idea ${title}`);
            }
        },
        {
            "User sends the idea message $body": (assert) => async function (body) {
                let editable = document.querySelector('[data-idea-composer] .tui-editor-contents[contenteditable="true"]');
                editable.focus();
                document.execCommand('insertText', false, body);
                // toast ui reports changes after a short debounce
                await new Promise(resolve => setTimeout(resolve, 400));
                await click('[data-idea-send]');
                assert.ok(true, 'User sends the message');
            }
        },
        {
            "User renames the idea to $title": (assert) => async function (title) {
                await click('[data-idea-title] .app-ui-inline-editable__surface');
                await fillIn('[data-idea-title] input', title);
                await click('[data-idea-title] .fa-check');
                assert.ok(true, 'User renames the idea');
            }
        },
        {
            "User archives the idea": (assert) => async function () {
                await click('[data-idea-archive]');
                await click('.modal .btn-primary');
                assert.ok(true, 'User archives the idea');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The idea message $body is saved and shown": (assert) => async function (body) {
                assert.ok(server.schema.ideamessages.findBy({ body }), 'the message is saved');
                assert.ok([...document.querySelectorAll('[data-idea-message-body]')].some(el => el.textContent.includes(body)), 'the message is shown');
            }
        },
        {
            "The idea is titled $title": (assert) => async function (title) {
                assert.ok(server.schema.ideas.findBy({ title }), 'the idea is renamed');
                assert.dom('[data-idea-title]').includesText(title);
            }
        },
        {
            "The idea is archived": (assert) => async function () {
                assert.ok(server.schema.ideas.findBy({ status: 'archived' }), 'the idea is archived');
                assert.dom('[data-idea-status]').hasText('Archived');
            }
        },
        {
            "The idea composer is disabled": (assert) => async function () {
                assert.dom('[data-idea-composer]').hasClass('idea-composer-disabled');
                assert.dom('[data-idea-send]').isDisabled();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
