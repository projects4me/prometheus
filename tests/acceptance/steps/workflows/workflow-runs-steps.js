/* global server */
import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';

const NODE = kind => `[data-workflow-node][data-node-kind="${kind}"]`;

export const given = function () {
    return [
        {
            "The workflow $id has a run that took the $kind step": () => async function (id, kind) {
                let node = server.schema.workflownodes.findBy({ workflowId: String(id), kind });
                let run = server.create('workflowrun', { workflowId: String(id), entityId: '5' });
                server.create('workflowrunstep', { runId: run.id, nodeId: String(node.id), sequence: 1, kind, category: 'trigger', port: 'next' });
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User clicks Runs on the workflow editor": (assert) => async function () {
                await click('[data-workflow-runs]');
                assert.ok(true, 'User opens the runs');
            }
        },
        {
            "User picks the first run in the list": (assert) => async function () {
                await click('[data-run]');
                assert.ok(true, 'User selects the run');
            }
        },
        {
            "User clicks Test run on the workflow editor": (assert) => async function () {
                await click('[data-workflow-test-run]');
                assert.ok(true, 'User opens the test run');
            }
        },
        {
            "User test runs the workflow for the record $id": (assert) => async function (id) {
                await fillIn('[data-field="workflowrun.entityId"] input', id);
                await click('[data-run-test]');
                assert.ok(true, 'User test runs the workflow');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The canvas marks the step $kind as ran": (assert) => async function (kind) {
                assert.dom(`${NODE(kind)}.ran`).exists();
            }
        },
        {
            "The run shows $count step": (assert) => async function (count) {
                assert.dom('[data-run-step]').exists({ count: Number(count) });
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
