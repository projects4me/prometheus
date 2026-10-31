import { click, currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
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
            "User toggles the plan review mode": (assert) => async function () {
                await click('[data-idea-plan-review]');
                assert.ok(true, 'User toggles the plan review mode');
            }
        },
        {
            "User opens the idea $title in plan review mode": (assert, ctx) => async function (title) {
                let project = ctx.get('currentProject');
                let idea = server.schema.ideas.findBy({ title });
                await visit(`/app/project/${project.shortCode}/idea/${idea.id}?view=plan`);
                assert.ok(true, 'User opens the idea in plan review mode');
            }
        },
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
            "The plan has the wide column": (assert) => async function () {
                assert.dom('[data-idea-side]').hasClass('col-md-8');
                assert.dom('[data-idea-main]').hasClass('col-md-4');
                assert.dom('[data-idea-plan-review] .fa-compress').exists();
                assert.equal(new URL(currentURL(), window.location.origin).searchParams.get('view'), 'plan');
            }
        },
        {
            "The conversation has the wide column": (assert) => async function () {
                assert.dom('[data-idea-main]').hasClass('col-md-8');
                assert.dom('[data-idea-side]').hasClass('col-md-4');
                assert.dom('[data-idea-plan-review] .fa-expand').exists();
                assert.notOk(new URL(currentURL(), window.location.origin).searchParams.has('view'));
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
