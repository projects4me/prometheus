import { click } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
        {
            "The idea $title has a Nestor message with the screen $screen and a step": (assert) => async function (title, screen) {
                let idea = server.schema.ideas.findBy({ title });
                // Gaia returns screens and steps as JSON text
                server.create('ideamessage', {
                    ideaId: idea.id,
                    kind: 'nestor',
                    body: 'Here is the mockup',
                    steps: JSON.stringify(['Drafted the layout']),
                    screens: JSON.stringify([{ uploadId: 'upload-1', key: 'login', title: screen, version: 2 }])
                });
                server.create('ideaplan', { ideaId: idea.id, version: 1, status: 'proposed', body: JSON.stringify({ summary: 'Plan summary', issues: [{ key: 'a', title: 'A', screens: ['login'] }] }) });
                assert.ok(true, 'The Nestor message and plan exist');
            }
        },
        {
            "The idea $title has a proposed plan": (assert) => async function (title) {
                let idea = server.schema.ideas.findBy({ title });
                server.create('ideaplan', { ideaId: idea.id, version: 1, status: 'proposed', body: JSON.stringify({ summary: 'Plan summary', issues: [] }) });
                assert.ok(true, 'The plan exists');
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User approves the plan": (assert) => async function () {
                await click('[data-idea-plan-approve]');
                await click('.modal .btn-primary');
                assert.ok(true, 'User approves the plan');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The screen $screen is listed in the thread and in the plan box": (assert) => async function (screen) {
                assert.dom('[data-idea-screens] [data-idea-screen-title]').includesText(screen);
                assert.dom('[data-idea-plan-screens] [data-idea-screen-title]').includesText(screen);
                assert.dom('[data-idea-plan-screens] [data-idea-screen-title]').includesText('2');
            }
        },
        {
            "The step of the Nestor message is listed": (assert) => async function () {
                await click('[data-idea-steps-toggle]');
                assert.dom('[data-idea-steps]').includesText('Drafted the layout');
            }
        },
        {
            "The plan is approved": (assert) => async function () {
                assert.ok(server.schema.ideaplans.findBy({ status: 'approved' }), 'the plan is approved');
                assert.dom('[data-idea-plan-status]').hasText('Approved');
                assert.dom('[data-idea-plan-approve]').doesNotExist();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
