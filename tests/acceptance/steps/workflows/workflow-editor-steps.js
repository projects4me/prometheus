/* global server */
import { click, currentURL, fillIn, findAll, triggerEvent } from '@ember/test-helpers';
import { Response } from 'miragejs';
import steps from '../steps';

const NODE = kind => `[data-workflow-node][data-node-kind="${kind}"]`;

function nodeKinds(workflowId) {
    return server.schema.workflownodes.where({ workflowId: String(workflowId) }).models;
}

export const given = function () {
    return [
        {
            "The $status workflow $name starts with an issue.created trigger": () => async function (status, name) {
                let workflow = server.create('workflow', { name, status });
                server.create('workflownode', { workflowId: workflow.id, category: 'trigger', kind: 'issue.created' });
            }
        },
        {
            "Gaia refuses new steps with $message": () => async function (message) {
                server.post('/workflownode', () => new Response(422, {}, { status: 'ERROR', messages: [message] }));
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User adds a $kind step from the palette": (assert) => async function (kind) {
                await click(`[data-palette-kind="${kind}"]`);
                assert.ok(true, `User adds a ${kind} step`);
            }
        },
        {
            "User connects the $port port of the $from step to the $to step": (assert) => async function (port, from, to) {
                await triggerEvent(`${NODE(from)} [data-output-port="${port}"]`, 'pointerdown', { button: 0 });
                await triggerEvent('[data-canvas-viewport]', 'pointerup', { button: 0 });
                await click(`${NODE(to)} [data-input-port]`);
                assert.ok(true, `User connects ${from} ${port} to ${to}`);
            }
        },
        {
            "User selects the connection from the $port port": (assert) => async function (port) {
                await click(`[data-edge-port="${port}"]`);
                assert.ok(true, 'User selects the connection');
            }
        },
        {
            "User removes the selected connection": (assert) => async function () {
                await click('[data-remove-edge]');
                assert.ok(true, 'User removes the connection');
            }
        },
        {
            "User enters $name in the workflow name": (assert) => async function (name) {
                await fillIn('[data-field="workflow.name"] input', name);
                assert.ok(true, 'User enters the workflow name');
            }
        },
        {
            "User saves the workflow": (assert) => async function () {
                await click('[data-workflow-save]');
                assert.ok(true, 'User saves the workflow');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The workflow $id has the steps $kinds": (assert) => async function (id, kinds) {
                assert.deepEqual(nodeKinds(id).map(node => node.kind), kinds.split(', '));
            }
        },
        {
            "The workflow $id has the connections $connections": (assert) => async function (id, connections) {
                let kindOf = new Map(nodeKinds(id).map(node => [String(node.id), node.kind]));
                let edges = server.schema.workflowedges.where({ workflowId: String(id) }).models
                    .map(edge => `${kindOf.get(String(edge.fromNodeId))} ${edge.fromPort} ${kindOf.get(String(edge.toNodeId))}`);
                assert.deepEqual(edges, connections.split(', '));
            }
        },
        {
            "The workflow $id has no connections": (assert) => async function (id) {
                assert.strictEqual(server.schema.workflowedges.where({ workflowId: String(id) }).models.length, 0);
            }
        },
        {
            "The canvas shows the steps $kinds": (assert) => async function (kinds) {
                assert.deepEqual(findAll('[data-workflow-node]').map(node => node.dataset.nodeKind), kinds.split(', '));
            }
        },
        {
            "The canvas says the steps are locked": (assert) => async function () {
                assert.dom('[data-graph-locked]').exists();
            }
        },
        {
            "The workflow $name is saved as a Draft": (assert) => async function (name) {
                let workflow = server.schema.workflows.findBy({ name });
                assert.ok(workflow, 'the workflow exists');
                assert.strictEqual(workflow.status, 'Draft');
            }
        },
        {
            "The $kind step shows the message $message": (assert) => async function (kind, message) {
                assert.dom(`${NODE(kind)}.has-errors`).exists();
                assert.dom('[data-node-errors]').hasText(message);
            }
        },
        {
            "No workflow is saved": (assert) => async function () {
                assert.strictEqual(server.schema.workflows.all().length, 0);
            }
        },
        {
            "User is on the page of workflow $id": (assert) => async function (id) {
                assert.strictEqual(currentURL(), `/app/workflow/${id}`);
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
