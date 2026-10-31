import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User opens the new idea page": (assert, ctx) => async function () {
                let project = ctx.get('currentProject');
                await visit(`/app/project/${project.shortCode}/idea/create`);
                assert.ok(true, 'User opens the new idea page');
            }
        },
        {
            "User enters $content in the idea title": (assert) => async function (content) {
                await fillIn('[data-field="idea.title"] input', content);
                assert.ok(true, 'User enters the idea title');
            }
        },
        {
            "User enters $content in the idea description": (assert) => async function (content) {
                await fillIn(document.querySelector('div[data-field="idea.description"] div.tui-editor-contents.tui-editor-contents-placeholder'), content);
                assert.ok(true, 'User enters the idea description');
            }
        },
        {
            "User clicks the cancel idea button": (assert) => async function () {
                await click('[data-idea-main] .btn-default');
                assert.ok(true, 'User clicks the cancel idea button');
            }
        },
        {
            "User confirms cancelling the idea": (assert) => async function () {
                await click(document.querySelector('[data-action="confirm"] a'));
                assert.ok(true, 'User confirms cancelling the idea');
            }
        },
        {
            "User clicks the start idea button": (assert) => async function () {
                await click('[data-start-idea]');
                assert.ok(true, 'User clicks the start idea button');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The idea $title is saved with the message $body": (assert) => async function (title, body) {
                let idea = server.schema.ideas.findBy({ title });
                assert.ok(idea, 'the idea exists');
                assert.equal(idea.description, body);
                let message = server.schema.ideamessages.findBy({ ideaId: idea.id });
                assert.ok(message, 'the first message exists');
                assert.equal(message.body, body);
            }
        },
        {
            "The idea title is empty": (assert) => async function () {
                assert.dom('[data-field="idea.title"] input').hasValue('');
            }
        },
        {
            "No idea is created": (assert) => async function () {
                assert.equal(server.schema.ideas.all().length, 0);
            }
        },
        {
            "User stays on the new idea page": (assert) => async function () {
                assert.ok(/\/idea\/create$/.test(currentURL()), `on the new idea page: ${currentURL()}`);
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
