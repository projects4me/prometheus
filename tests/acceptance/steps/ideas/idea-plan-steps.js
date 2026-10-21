import { click } from '@ember/test-helpers';
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
