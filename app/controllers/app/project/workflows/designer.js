/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Workflow Designer Controller for Project
 * Handles the visual workflow designer interface and interactions
 *
 * @class AppProjectWorkflowsDesignerController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 */
export default class AppProjectWorkflowsDesignerController extends Controller {
    @service store;
    @service router;
    @service flashMessages;
    @service currentUser;
    @service acl;

    @tracked isLoading = false;
    @tracked errors = [];
    @tracked hasUnsavedChanges = false;
    @tracked selectedNode = null;
    @tracked selectedTransition = null;
    @tracked showNodeProperties = false;
    @tracked showTransitionProperties = false;
    @tracked showRuleEditor = false;

    /**
     * Check if user can design workflows
     *
     * @method get canDesignWorkflow
     * @return {Boolean} Whether user can design workflows
     * @public
     */
    get canDesignWorkflow() {
        return this.acl.checkAccess('App.Project.Workflow.Design');
    }

    /**
     * Get available node types for the workflow designer
     *
     * @method get nodeTypes
     * @return {Array} Available node types
     * @public
     */
    get nodeTypes() {
        return [
            {
                type: 'start',
                label: 'Start Event',
                icon: 'fa-play-circle',
                color: '#28a745',
                description: 'Workflow starting point'
            },
            {
                type: 'end',
                label: 'End Event',
                icon: 'fa-stop-circle',
                color: '#dc3545',
                description: 'Workflow ending point'
            },
            {
                type: 'task',
                label: 'Task',
                icon: 'fa-square',
                color: '#007bff',
                description: 'Manual or automated task'
            },
            {
                type: 'gateway',
                label: 'Gateway',
                icon: 'fa-diamond',
                color: '#ffc107',
                description: 'Decision point with conditions'
            },
            {
                type: 'event',
                label: 'Intermediate Event',
                icon: 'fa-circle',
                color: '#6c757d',
                description: 'Timer, message, or signal event'
            }
        ];
    }

    /**
     * Get workflow nodes for the canvas
     *
     * @method get workflowNodes
     * @return {Array} Workflow nodes with positioning
     * @public
     */
    get workflowNodes() {
        return this.model?.workflow?.workflowNodes || [];
    }

    /**
     * Get workflow transitions for the canvas
     *
     * @method get workflowTransitions
     * @return {Array} Workflow transitions
     * @public
     */
    get workflowTransitions() {
        return this.model?.workflow?.workflowTransitions || [];
    }

    /**
     * Save the workflow design
     *
     * @method saveWorkflow
     * @public
     */
    @action async saveWorkflow() {
        if (!this.canDesignWorkflow) {
            this.flashMessages.error('You do not have permission to design workflows');
            return;
        }

        this.isLoading = true;
        this.errors = [];

        try {
            const workflow = this.model.workflow;
            
            // Update workflow metadata
            workflow.set('modifiedUser', this.currentUser.user?.id);
            
            // Save the workflow
            await workflow.save();

            // Save all nodes
            await Promise.all(
                this.workflowNodes.map(node => node.save())
            );

            // Save all transitions
            await Promise.all(
                this.workflowTransitions.map(transition => transition.save())
            );

            this.flashMessages.success(`Workflow "${workflow.name}" saved successfully`);
            this.hasUnsavedChanges = false;
            
            // Trigger route action
            this.send('workflowSaved', workflow);
        } catch (error) {
            console.error('Error saving workflow:', error);
            
            this.errors = [error.message || 'Failed to save workflow'];
            this.flashMessages.error('Failed to save workflow');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Add a new node to the workflow
     *
     * @method addNode
     * @param {String} nodeType The type of node to add
     * @param {Object} position The position where to add the node
     * @public
     */
    @action addNode(nodeType, position = { x: 100, y: 100 }) {
        const workflow = this.model.workflow;
        const nodeCount = this.workflowNodes.length;
        
        const newNode = this.store.createRecord('workflow-node', {
            workflowDefinitionId: workflow.id,
            name: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${nodeCount + 1}`,
            type: nodeType,
            positionX: position.x,
            positionY: position.y,
            properties: JSON.stringify({
                description: '',
                assignee: null,
                dueDate: null,
                priority: 'medium'
            }),
            createdUser: this.currentUser.user?.id,
            modifiedUser: this.currentUser.user?.id
        });

        this.hasUnsavedChanges = true;
        this.flashMessages.info(`${nodeType} node added to workflow`);
    }

    /**
     * Delete a node from the workflow
     *
     * @method deleteNode
     * @param {Object} node The node to delete
     * @public
     */
    @action async deleteNode(node) {
        if (!confirm(`Are you sure you want to delete the node "${node.name}"?`)) {
            return;
        }

        try {
            // Delete related transitions first
            const relatedTransitions = this.workflowTransitions.filter(
                transition => transition.sourceNodeId === node.id || transition.targetNodeId === node.id
            );

            await Promise.all(
                relatedTransitions.map(transition => transition.destroyRecord())
            );

            // Delete the node
            await node.destroyRecord();

            this.hasUnsavedChanges = true;
            this.flashMessages.success(`Node "${node.name}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting node:', error);
            this.flashMessages.error('Failed to delete node');
        }
    }

    /**
     * Add a transition between two nodes
     *
     * @method addTransition
     * @param {Object} sourceNode The source node
     * @param {Object} targetNode The target node
     * @public
     */
    @action addTransition(sourceNode, targetNode) {
        if (sourceNode.id === targetNode.id) {
            this.flashMessages.warning('Cannot create transition to the same node');
            return;
        }

        // Check if transition already exists
        const existingTransition = this.workflowTransitions.find(
            transition => transition.sourceNodeId === sourceNode.id && 
                         transition.targetNodeId === targetNode.id
        );

        if (existingTransition) {
            this.flashMessages.warning('Transition already exists between these nodes');
            return;
        }

        const newTransition = this.store.createRecord('workflow-transition', {
            workflowDefinitionId: this.model.workflow.id,
            sourceNodeId: sourceNode.id,
            targetNodeId: targetNode.id,
            name: `${sourceNode.name} → ${targetNode.name}`,
            condition: '',
            properties: JSON.stringify({
                label: '',
                color: '#007bff',
                style: 'solid'
            }),
            createdUser: this.currentUser.user?.id,
            modifiedUser: this.currentUser.user?.id
        });

        this.hasUnsavedChanges = true;
        this.flashMessages.info('Transition added between nodes');
    }

    /**
     * Delete a transition
     *
     * @method deleteTransition
     * @param {Object} transition The transition to delete
     * @public
     */
    @action async deleteTransition(transition) {
        if (!confirm('Are you sure you want to delete this transition?')) {
            return;
        }

        try {
            await transition.destroyRecord();
            
            this.hasUnsavedChanges = true;
            this.flashMessages.success('Transition deleted successfully');
        } catch (error) {
            console.error('Error deleting transition:', error);
            this.flashMessages.error('Failed to delete transition');
        }
    }

    /**
     * Select a node for editing
     *
     * @method selectNode
     * @param {Object} node The node to select
     * @public
     */
    @action selectNode(node) {
        this.selectedNode = node;
        this.selectedTransition = null;
        this.showNodeProperties = true;
        this.showTransitionProperties = false;
    }

    /**
     * Select a transition for editing
     *
     * @method selectTransition
     * @param {Object} transition The transition to select
     * @public
     */
    @action selectTransition(transition) {
        this.selectedTransition = transition;
        this.selectedNode = null;
        this.showTransitionProperties = true;
        this.showNodeProperties = false;
    }

    /**
     * Update node properties
     *
     * @method updateNodeProperties
     * @param {Object} node The node to update
     * @param {Object} properties The new properties
     * @public
     */
    @action updateNodeProperties(node, properties) {
        node.setProperties(properties);
        this.hasUnsavedChanges = true;
    }

    /**
     * Update transition properties
     *
     * @method updateTransitionProperties
     * @param {Object} transition The transition to update
     * @param {Object} properties The new properties
     * @public
     */
    @action updateTransitionProperties(transition, properties) {
        transition.setProperties(properties);
        this.hasUnsavedChanges = true;
    }

    /**
     * Move a node to a new position
     *
     * @method moveNode
     * @param {Object} node The node to move
     * @param {Object} position The new position
     * @public
     */
    @action moveNode(node, position) {
        node.setProperties({
            positionX: position.x,
            positionY: position.y
        });
        this.hasUnsavedChanges = true;
    }

    /**
     * Clear selection
     *
     * @method clearSelection
     * @public
     */
    @action clearSelection() {
        this.selectedNode = null;
        this.selectedTransition = null;
        this.showNodeProperties = false;
        this.showTransitionProperties = false;
    }

    /**
     * Toggle rule editor
     *
     * @method toggleRuleEditor
     * @public
     */
    @action toggleRuleEditor() {
        this.showRuleEditor = !this.showRuleEditor;
    }

    /**
     * Validate workflow design
     *
     * @method validateWorkflow
     * @public
     */
    @action validateWorkflow() {
        const errors = [];
        const nodes = this.workflowNodes;
        const transitions = this.workflowTransitions;

        // Check for start node
        const startNodes = nodes.filter(node => node.type === 'start');
        if (startNodes.length === 0) {
            errors.push('Workflow must have at least one start node');
        } else if (startNodes.length > 1) {
            errors.push('Workflow can only have one start node');
        }

        // Check for end node
        const endNodes = nodes.filter(node => node.type === 'end');
        if (endNodes.length === 0) {
            errors.push('Workflow must have at least one end node');
        }

        // Check for orphaned nodes
        nodes.forEach(node => {
            if (node.type !== 'start') {
                const hasIncoming = transitions.some(t => t.targetNodeId === node.id);
                if (!hasIncoming) {
                    errors.push(`Node "${node.name}" has no incoming transitions`);
                }
            }
            
            if (node.type !== 'end') {
                const hasOutgoing = transitions.some(t => t.sourceNodeId === node.id);
                if (!hasOutgoing) {
                    errors.push(`Node "${node.name}" has no outgoing transitions`);
                }
            }
        });

        if (errors.length > 0) {
            this.errors = errors;
            this.flashMessages.error('Workflow validation failed');
        } else {
            this.errors = [];
            this.flashMessages.success('Workflow validation passed');
        }

        return errors.length === 0;
    }

    /**
     * Export workflow as BPMN XML
     *
     * @method exportBPMN
     * @public
     */
    @action exportBPMN() {
        // This would generate BPMN XML from the workflow definition
        // For now, we'll create a simple JSON export
        const workflowData = {
            workflow: this.model.workflow.toJSON(),
            nodes: this.workflowNodes.map(node => node.toJSON()),
            transitions: this.workflowTransitions.map(transition => transition.toJSON())
        };

        const dataStr = JSON.stringify(workflowData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.model.workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`;
        link.click();
        
        this.flashMessages.success('Workflow exported successfully');
    }

    /**
     * Navigate back to workflow list
     *
     * @method backToList
     * @public
     */
    @action backToList() {
        if (this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
            }
        }
        
        this.send('backToList');
    }

    /**
     * Clear errors
     *
     * @method clearErrors
     * @public
     */
    @action clearErrors() {
        this.errors = [];
    }
}
