/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Basic Workflow Designer Component
 * Provides a simple interface for designing workflows
 *
 * @class WorkflowWorkflowDesignerComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkflowWorkflowDesignerComponent extends Component {
    @service store;
    @service flashMessages;

    @tracked nodes = [];
    @tracked selectedNode = null;
    @tracked isAddingNode = false;
    @tracked newNodeType = 'task';
    @tracked newNodeName = '';
    @tracked newNodeDescription = '';

    constructor() {
        super(...arguments);
        this.initializeWorkflow();
    }

    /**
     * Initialize the workflow with existing nodes or create a basic structure
     *
     * @method initializeWorkflow
     * @private
     */
    initializeWorkflow() {
        if (this.args.workflow && this.args.workflow.workflowNodes) {
            this.nodes = this.args.workflow.workflowNodes.toArray();
        } else {
            // Create a basic workflow with start and end nodes
            this.nodes = [
                {
                    id: 'start-1',
                    nodeId: 'start-1',
                    nodeType: 'start',
                    name: 'Start',
                    description: 'Workflow start point',
                    positionX: 100,
                    positionY: 100,
                    configuration: JSON.stringify({})
                },
                {
                    id: 'end-1',
                    nodeId: 'end-1',
                    nodeType: 'end',
                    name: 'End',
                    description: 'Workflow end point',
                    positionX: 500,
                    positionY: 100,
                    configuration: JSON.stringify({})
                }
            ];
        }
    }

    /**
     * Add a new node to the workflow
     *
     * @method addNode
     * @public
     */
    @action addNode() {
        if (!this.newNodeName.trim()) {
            this.flashMessages.error('Node name is required');
            return;
        }

        const nodeId = `${this.newNodeType}-${Date.now()}`;
        const newNode = {
            id: nodeId,
            nodeId: nodeId,
            nodeType: this.newNodeType,
            name: this.newNodeName,
            description: this.newNodeDescription,
            positionX: 300,
            positionY: 100 + (this.nodes.length * 50),
            configuration: JSON.stringify({}),
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        this.nodes.push(newNode);
        this.resetNewNodeForm();
        this.flashMessages.success(`Added ${this.newNodeType} node: ${this.newNodeName}`);
    }

    /**
     * Reset the new node form
     *
     * @method resetNewNodeForm
     * @private
     */
    resetNewNodeForm() {
        this.newNodeName = '';
        this.newNodeDescription = '';
        this.newNodeType = 'task';
        this.isAddingNode = false;
    }

    /**
     * Select a node for editing
     *
     * @method selectNode
     * @param {Object} node The node to select
     * @public
     */
    @action selectNode(node) {
        this.selectedNode = { ...node };
    }

    /**
     * Update node properties
     *
     * @method updateNode
     * @public
     */
    @action updateNode() {
        if (!this.selectedNode) return;

        const nodeIndex = this.nodes.findIndex(n => n.id === this.selectedNode.id);
        if (nodeIndex !== -1) {
            this.nodes[nodeIndex] = { ...this.selectedNode };
            this.flashMessages.success(`Updated node: ${this.selectedNode.name}`);
        }
        this.selectedNode = null;
    }

    /**
     * Delete a node from the workflow
     *
     * @method deleteNode
     * @param {Object} node The node to delete
     * @public
     */
    @action deleteNode(node) {
        if (node.nodeType === 'start' || node.nodeType === 'end') {
            this.flashMessages.error('Cannot delete start or end nodes');
            return;
        }

        if (confirm(`Are you sure you want to delete node "${node.name}"?`)) {
            this.nodes = this.nodes.filter(n => n.id !== node.id);
            this.selectedNode = null;
            this.flashMessages.success(`Deleted node: ${node.name}`);
        }
    }

    /**
     * Save the workflow definition
     *
     * @method saveWorkflow
     * @public
     */
    @action async saveWorkflow() {
        try {
            const workflow = this.args.workflow;
            
            // Convert nodes to JSON format
            const workflowData = {
                nodes: this.nodes,
                version: workflow.version || '1.0',
                lastModified: new Date().toISOString()
            };

            // Save as JSON string (will be enhanced to BPMN later)
            workflow.set('bpmnXml', JSON.stringify(workflowData, null, 2));
            workflow.set('dateModified', new Date().toISOString());
            
            await workflow.save();
            
            this.flashMessages.success('Workflow saved successfully');
            
            if (this.args.onSave) {
                this.args.onSave(workflow);
            }
        } catch (error) {
            console.error('Error saving workflow:', error);
            this.flashMessages.error('Failed to save workflow');
        }
    }

    /**
     * Export workflow as JSON
     *
     * @method exportWorkflow
     * @public
     */
    @action exportWorkflow() {
        const workflowData = {
            name: this.args.workflow.name,
            description: this.args.workflow.description,
            version: this.args.workflow.version,
            nodes: this.nodes,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(workflowData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.args.workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`;
        link.click();
        
        this.flashMessages.success('Workflow exported successfully');
    }

    /**
     * Get available node types
     *
     * @method get nodeTypes
     * @return {Array} Array of available node types
     * @public
     */
    get nodeTypes() {
        return [
            { value: 'start', label: 'Start', description: 'Workflow start point' },
            { value: 'task', label: 'Task', description: 'Work item or activity' },
            { value: 'gateway', label: 'Gateway', description: 'Decision point or split' },
            { value: 'event', label: 'Event', description: 'System or user event' },
            { value: 'end', label: 'End', description: 'Workflow end point' }
        ];
    }

    /**
     * Get nodes by type
     *
     * @method get nodesByType
     * @return {Object} Nodes grouped by type
     * @public
     */
    get nodesByType() {
        const grouped = {};
        this.nodes.forEach(node => {
            if (!grouped[node.nodeType]) {
                grouped[node.nodeType] = [];
            }
            grouped[node.nodeType].push(node);
        });
        return grouped;
    }

    /**
     * Check if workflow is valid
     *
     * @method get isValid
     * @return {Boolean} True if workflow is valid
     * @public
     */
    get isValid() {
        const hasStart = this.nodes.some(node => node.nodeType === 'start');
        const hasEnd = this.nodes.some(node => node.nodeType === 'end');
        const hasTasks = this.nodes.some(node => node.nodeType === 'task');
        
        return hasStart && hasEnd && hasTasks;
    }

    /**
     * Get validation errors
     *
     * @method get validationErrors
     * @return {Array} Array of validation error messages
     * @public
     */
    get validationErrors() {
        const errors = [];
        
        if (!this.nodes.some(node => node.nodeType === 'start')) {
            errors.push('Workflow must have a start node');
        }
        
        if (!this.nodes.some(node => node.nodeType === 'end')) {
            errors.push('Workflow must have an end node');
        }
        
        if (!this.nodes.some(node => node.nodeType === 'task')) {
            errors.push('Workflow must have at least one task node');
        }
        
        return errors;
    }
} 