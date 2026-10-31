/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { hasInput, portsOf } from './node-catalog';

let nextKey = 0;

/**
 * Reads a node's JSON config text; an unreadable config reads as empty
 *
 * @method parseConfig
 * @param {String} text
 * @return {Object}
 * @private
 */
function parseConfig(text) {
    if (!text) {
        return {};
    }
    try {
        let config = JSON.parse(text);
        return config && typeof config === 'object' && !Array.isArray(config) ? config : {};
    } catch (e) {
        return {};
    }
}

/**
 * A node of the graph being edited, with the saved record it came from, if any
 *
 * @class GraphNode
 * @namespace Prometheus.Utils.Workflow
 */
export class GraphNode {
    /**
     * @property key
     * @type String
     * @public
     */
    key = `node-${++nextKey}`;

    /**
     * The saved workflownode, null until the node is saved
     *
     * @property record
     * @type Prometheus.Models.Workflownode
     * @public
     */
    @tracked record = null;

    /**
     * @property category
     * @type String
     * @public
     */
    category;

    /**
     * @property kind
     * @type String
     * @public
     */
    kind;

    /**
     * @property name
     * @type String
     * @public
     */
    @tracked name = '';

    /**
     * @property config
     * @type Object
     * @public
     */
    @tracked config = {};

    /**
     * @property x
     * @type Number
     * @public
     */
    @tracked x = 0;

    /**
     * @property y
     * @type Number
     * @public
     */
    @tracked y = 0;

    /**
     * The messages of the last save that failed, empty when it saved
     *
     * @property errors
     * @type Array
     * @public
     */
    @tracked errors = [];

    constructor(attrs = {}) {
        Object.assign(this, attrs);
    }

    /**
     * @property ports
     * @type Array
     * @public
     */
    get ports() {
        return portsOf(this.category, this.kind, this.config);
    }

    /**
     * @property hasInput
     * @type Boolean
     * @public
     */
    get hasInput() {
        return hasInput(this.category);
    }
}

/**
 * An edge of the graph being edited, from an output port of one node to another node
 *
 * @class GraphEdge
 * @namespace Prometheus.Utils.Workflow
 */
export class GraphEdge {
    /**
     * @property key
     * @type String
     * @public
     */
    key = `edge-${++nextKey}`;

    /**
     * The saved workflowedge, null until the edge is saved
     *
     * @property record
     * @type Prometheus.Models.Workflowedge
     * @public
     */
    @tracked record = null;

    /**
     * @property from
     * @type GraphNode
     * @public
     */
    from;

    /**
     * @property port
     * @type String
     * @public
     */
    port;

    /**
     * @property to
     * @type GraphNode
     * @public
     */
    to;

    /**
     * The messages of the last save that failed, empty when it saved
     *
     * @property errors
     * @type Array
     * @public
     */
    @tracked errors = [];

    constructor(attrs = {}) {
        Object.assign(this, attrs);
    }
}

/**
 * The graph of a workflow while it is edited: its nodes and edges, and the saved records the user removed.
 * It knows the shape of a graph only; Gaia validates the workflow rules on save.
 *
 * @class WorkflowGraph
 * @namespace Prometheus.Utils.Workflow
 */
export default class WorkflowGraph {
    /**
     * @property nodes
     * @type Array
     * @public
     */
    @tracked nodes = [];

    /**
     * @property edges
     * @type Array
     * @public
     */
    @tracked edges = [];

    /**
     * Saved nodes and edges the user removed, to delete on save
     *
     * @property removedRecords
     * @type Array
     * @public
     */
    removedRecords = [];

    /**
     * Builds the graph of saved workflownode and workflowedge records
     *
     * @method fromRecords
     * @param {Array} nodeRecords
     * @param {Array} edgeRecords
     * @return {WorkflowGraph}
     * @static
     */
    static fromRecords(nodeRecords = [], edgeRecords = []) {
        let graph = new WorkflowGraph();
        graph.nodes = nodeRecords.map(record => new GraphNode({
            record,
            category: record.category,
            kind: record.kind,
            name: record.name ?? '',
            config: parseConfig(record.config),
            x: Number(record.positionX) || 0,
            y: Number(record.positionY) || 0
        }));
        let byId = new Map(graph.nodes.map(node => [String(node.record.id), node]));
        graph.edges = edgeRecords
            .filter(record => byId.has(String(record.fromNodeId)) && byId.has(String(record.toNodeId)))
            .map(record => new GraphEdge({
                record,
                from: byId.get(String(record.fromNodeId)),
                port: record.fromPort,
                to: byId.get(String(record.toNodeId))
            }));
        return graph;
    }

    /**
     * Adds a node of a kind at a canvas point
     *
     * @method addNode
     * @param {String} category
     * @param {String} kind
     * @param {Number} x
     * @param {Number} y
     * @return {GraphNode}
     * @public
     */
    addNode(category, kind, x, y) {
        let node = new GraphNode({ category, kind, x: Math.round(x), y: Math.round(y) });
        this.nodes = [...this.nodes, node];
        return node;
    }

    /**
     * @method moveNode
     * @param {GraphNode} node
     * @param {Number} x
     * @param {Number} y
     * @public
     */
    moveNode(node, x, y) {
        node.x = Math.round(x);
        node.y = Math.round(y);
    }

    /**
     * Removes a node and the edges that touch it
     *
     * @method removeNode
     * @param {GraphNode} node
     * @public
     */
    removeNode(node) {
        this.edges.filter(edge => edge.from === node || edge.to === node).forEach(edge => this.removeEdge(edge));
        this.nodes = this.nodes.filter(other => other !== node);
        this._forget(node);
    }

    /**
     * Connects an output port of one node to another node. A port leads to one node, so an earlier edge from
     * the same port is replaced. Returns null when the connection can't be drawn.
     *
     * @method connect
     * @param {GraphNode} from
     * @param {String} port
     * @param {GraphNode} to
     * @return {GraphEdge}
     * @public
     */
    connect(from, port, to) {
        if (!from || !to || from === to || !to.hasInput || !from.ports.includes(port)) {
            return null;
        }
        let existing = this.edgeFrom(from, port);
        if (existing && existing.to === to) {
            return existing;
        }
        if (existing) {
            this.removeEdge(existing);
        }
        let edge = new GraphEdge({ from, port, to });
        this.edges = [...this.edges, edge];
        return edge;
    }

    /**
     * @method removeEdge
     * @param {GraphEdge} edge
     * @public
     */
    removeEdge(edge) {
        this.edges = this.edges.filter(other => other !== edge);
        this._forget(edge);
    }

    /**
     * The edge that leaves a node from a port
     *
     * @method edgeFrom
     * @param {GraphNode} node
     * @param {String} port
     * @return {GraphEdge}
     * @public
     */
    edgeFrom(node, port) {
        return this.edges.find(edge => edge.from === node && edge.port === port);
    }

    /**
     * Keeps the saved record of a removed node or edge, to delete it on save
     *
     * @method _forget
     * @param {GraphNode|GraphEdge} item
     * @private
     */
    _forget(item) {
        if (item.record) {
            this.removedRecords.push(item.record);
        }
    }
}
