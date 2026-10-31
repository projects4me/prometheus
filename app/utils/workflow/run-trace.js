/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Reads a value Gaia stores as JSON text and a test run returns as an object; unreadable text reads as empty
 *
 * @method parseJson
 * @param {String|Object} value
 * @return {Object}
 * @public
 */
export function parseJson(value) {
    if (value && typeof value === 'object') {
        return value;
    }
    try {
        let parsed = JSON.parse(value || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

/**
 * Turns step records or the steps of a test run into plain steps in the order taken, with inputs and
 * outputs as objects and as pretty JSON text for display
 *
 * @method normalizeSteps
 * @param {Array} raw
 * @return {Array}
 * @public
 */
export function normalizeSteps(raw) {
    return (raw ?? []).map(step => {
        let inputs = parseJson(step.inputs);
        let outputs = parseJson(step.outputs);
        return {
            sequence: Number(step.sequence),
            nodeId: String(step.nodeId),
            category: step.category,
            kind: step.kind,
            status: step.status,
            port: step.port || null,
            error: step.error || null,
            inputs,
            outputs,
            inputsText: JSON.stringify(inputs, null, 2),
            outputsText: JSON.stringify(outputs, null, 2)
        };
    }).sort((a, b) => a.sequence - b.sequence);
}

/**
 * The path of a run over the flow: which node each step ran and which connections it took
 *
 * @class RunTrace
 * @namespace Prometheus.Utils.Workflow
 */
export default class RunTrace {
    /**
     * @param {Array} steps normalized steps
     */
    constructor(steps = []) {
        this.steps = steps;
        this.byNode = new Map();
        steps.forEach(step => {
            let list = this.byNode.get(step.nodeId) || [];
            list.push(step);
            this.byNode.set(step.nodeId, list);
        });
    }

    /**
     * The steps that ran a node (more than one when the run came back to it), empty when the run never reached it
     *
     * @method stepsOf
     * @param {GraphNode} node
     * @return {Array}
     * @public
     */
    stepsOf(node) {
        return node.record ? this.byNode.get(String(node.record.id)) || [] : [];
    }

    /**
     * The first step that ran a node, if the run reached it
     *
     * @method stepOf
     * @param {GraphNode} node
     * @return {Object|undefined}
     * @public
     */
    stepOf(node) {
        return this.stepsOf(node)[0];
    }

    /**
     * Whether the run left the edge's node by the edge's port and went on to the edge's target
     *
     * @method tookEdge
     * @param {GraphEdge} edge
     * @return {Boolean}
     * @public
     */
    tookEdge(edge) {
        let targets = this.stepsOf(edge.to);
        return this.stepsOf(edge.from).some(from => from.port === edge.port
            && targets.some(to => to.sequence === from.sequence + 1));
    }
}
