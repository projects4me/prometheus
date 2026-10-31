/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import WorkflowGraph from 'prometheus/utils/workflow/graph';

/**
 * Loads a workflow's graph from its workflownode and workflowedge records, and saves the edited graph back
 * through them: removed edges and nodes are deleted, new and changed nodes saved, then new edges created.
 * Gaia validates each node and edge; the ones it refuses keep its messages in their `errors` and stay
 * unsaved, so the user can fix them and save again.
 *
 * @class WorkflowGraphService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class WorkflowGraphService extends Service {
    /**
     * @property store
     * @type Ember.Service
     * @public
     */
    @service store;

    /**
     * @property intl
     * @type Ember.Service
     * @public
     */
    @service intl;

    /**
     * Loads the graph of a saved workflow
     *
     * @method load
     * @param {String} workflowId
     * @return {Promise} resolves to a WorkflowGraph
     * @public
     */
    async load(workflowId) {
        let [nodes, edges] = await Promise.all([
            this.store.query('workflownode', { query: `(Workflownode.workflowId : ${workflowId})`, limit: -1 }),
            this.store.query('workflowedge', { query: `(Workflowedge.workflowId : ${workflowId})`, limit: -1 })
        ]);
        return WorkflowGraph.fromRecords(nodes.toArray(), edges.toArray());
    }

    /**
     * Saves a workflow and its graph. Gaia checks the whole graph when a workflow becomes Active and locks
     * the graph of an Active workflow, so an activation saves the graph first and any other status saves the
     * workflow first.
     *
     * @method saveWorkflow
     * @param {Prometheus.Models.Workflow} workflow
     * @param {WorkflowGraph} graph
     * @return {Promise} resolves to the number of nodes, edges and removals that could not be saved
     * @public
     */
    async saveWorkflow(workflow, graph) {
        let activating = workflow.status === 'Active' && !workflow.isNew;
        if (!activating) {
            await workflow.save();
        }
        let problems = await this.save(workflow, graph);
        if (activating && workflow.hasDirtyAttributes) {
            await workflow.save();
        }
        return problems;
    }

    /**
     * Saves the graph of a saved workflow
     *
     * @method save
     * @param {Prometheus.Models.Workflow} workflow
     * @param {WorkflowGraph} graph
     * @return {Promise} resolves to the number of nodes, edges and removals that could not be saved
     * @public
     */
    async save(workflow, graph) {
        let problems = await this._deleteRemoved(graph);
        let saves = [];
        let { nodes, edges } = graph;
        for (let i = 0; i < nodes.length; i++) {
            saves.push(await this._saveNode(workflow, nodes[i]));
        }
        for (let i = 0; i < edges.length; i++) {
            saves.push(await this._saveEdge(workflow, edges[i]));
        }
        return problems + saves.filter(saved => !saved).length;
    }

    /**
     * Deletes the saved edges, then the saved nodes, the user removed. The ones that fail stay queued.
     *
     * @method _deleteRemoved
     * @param {WorkflowGraph} graph
     * @return {Promise} resolves to the number of failed deletes
     * @private
     */
    async _deleteRemoved(graph) {
        let queued = [...graph.removedRecords].sort((a, b) => this._deleteOrder(a) - this._deleteOrder(b));
        let failed = [];
        for (let i = 0; i < queued.length; i++) {
            let record = queued[i];
            try {
                await record.destroyRecord();
            } catch (error) {
                record.rollbackAttributes();
                failed.push(record);
            }
        }
        graph.removedRecords = failed;
        return failed.length;
    }

    /**
     * Edges are deleted before the nodes they join
     *
     * @method _deleteOrder
     * @param {Model} record
     * @return {Number}
     * @private
     */
    _deleteOrder(record) {
        return record.constructor.modelName === 'workflowedge' ? 0 : 1;
    }

    /**
     * Creates a new node, or saves the changes of a saved one
     *
     * @method _saveNode
     * @param {Prometheus.Models.Workflow} workflow
     * @param {GraphNode} node
     * @return {Promise} resolves to whether the node is saved
     * @private
     */
    async _saveNode(workflow, node) {
        let attributes = {
            name: node.name,
            config: JSON.stringify(node.config ?? {}),
            positionX: node.x,
            positionY: node.y
        };
        let record = node.record;
        if (!record) {
            record = this.store.createRecord('workflownode', {
                ...attributes,
                workflowId: workflow.id,
                category: node.category,
                kind: node.kind
            });
        } else {
            Object.entries(attributes).forEach(([name, value]) => {
                if (record[name] !== value) {
                    record[name] = value;
                }
            });
            if (!record.hasDirtyAttributes) {
                node.errors = [];
                return true;
            }
        }
        try {
            await record.save();
            node.record = record;
            node.errors = [];
            return true;
        } catch (error) {
            this._discard(record);
            node.errors = this._messages(error);
            return false;
        }
    }

    /**
     * Creates a new edge once both of its nodes are saved
     *
     * @method _saveEdge
     * @param {Prometheus.Models.Workflow} workflow
     * @param {GraphEdge} edge
     * @return {Promise} resolves to whether the edge is saved
     * @private
     */
    async _saveEdge(workflow, edge) {
        if (edge.record) {
            return true;
        }
        if (!edge.from.record || !edge.to.record) {
            edge.errors = [this.intl.t('views.app.workflow.editor.edgeNodeUnsaved')];
            return false;
        }
        let record = this.store.createRecord('workflowedge', {
            workflowId: workflow.id,
            fromNodeId: edge.from.record.id,
            fromPort: edge.port,
            toNodeId: edge.to.record.id
        });
        try {
            await record.save();
            edge.record = record;
            edge.errors = [];
            return true;
        } catch (error) {
            this._discard(record);
            edge.errors = this._messages(error);
            return false;
        }
    }

    /**
     * Drops a record whose save failed: a new one leaves the store, a saved one goes back to what was saved
     *
     * @method _discard
     * @param {Model} record
     * @private
     */
    _discard(record) {
        if (record.isNew) {
            record.unloadRecord();
        } else {
            record.rollbackAttributes();
        }
    }

    /**
     * The messages of a failed save
     *
     * @method _messages
     * @param {Error} error
     * @return {Array}
     * @private
     */
    _messages(error) {
        let messages = (error?.errors ?? []).map(entry => entry?.detail).filter(Boolean);
        return messages.length ? messages : [this.intl.t('views.app.workflow.editor.saveFailed')];
    }
}
