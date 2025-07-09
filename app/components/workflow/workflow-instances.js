/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Workflow Instances Monitor Component
 * Shows active workflow instances and allows manual intervention
 *
 * @class WorkflowWorkflowInstancesComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkflowWorkflowInstancesComponent extends Component {
    @service store;
    @service workflowEngine;
    @service flashMessages;

    @tracked instances = [];
    @tracked selectedInstance = null;
    @tracked isLoading = false;
    @tracked filterStatus = 'all';
    @tracked searchTerm = '';

    constructor() {
        super(...arguments);
        this.loadInstances();
    }

    /**
     * Load workflow instances
     *
     * @method loadInstances
     * @private
     */
    async loadInstances() {
        this.isLoading = true;
        
        try {
            const instances = await this.store.query('workflow-instance', {
                workflowDefinitionId: this.args.workflowId,
                include: 'workflowDefinition,currentNode'
            });
            
            this.instances = instances.toArray();
        } catch (error) {
            console.error('Error loading workflow instances:', error);
            this.flashMessages.error('Failed to load workflow instances');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Select an instance for detailed view
     *
     * @method selectInstance
     * @param {Object} instance The workflow instance to select
     * @public
     */
    @action selectInstance(instance) {
        this.selectedInstance = instance;
    }

    /**
     * Suspend a workflow instance
     *
     * @method suspendInstance
     * @param {Object} instance The workflow instance to suspend
     * @public
     */
    @action async suspendInstance(instance) {
        try {
            instance.set('status', 'suspended');
            await instance.save();
            
            this.flashMessages.success(`Workflow instance suspended`);
            this.loadInstances(); // Refresh the list
        } catch (error) {
            console.error('Error suspending instance:', error);
            this.flashMessages.error('Failed to suspend workflow instance');
        }
    }

    /**
     * Resume a suspended workflow instance
     *
     * @method resumeInstance
     * @param {Object} instance The workflow instance to resume
     * @public
     */
    @action async resumeInstance(instance) {
        try {
            instance.set('status', 'active');
            await instance.save();
            
            this.flashMessages.success(`Workflow instance resumed`);
            this.loadInstances(); // Refresh the list
        } catch (error) {
            console.error('Error resuming instance:', error);
            this.flashMessages.error('Failed to resume workflow instance');
        }
    }

    /**
     * Terminate a workflow instance
     *
     * @method terminateInstance
     * @param {Object} instance The workflow instance to terminate
     * @public
     */
    @action async terminateInstance(instance) {
        if (!confirm(`Are you sure you want to terminate this workflow instance?`)) {
            return;
        }

        try {
            instance.setProperties({
                status: 'terminated',
                completedAt: new Date().toISOString()
            });
            await instance.save();
            
            this.flashMessages.success(`Workflow instance terminated`);
            this.loadInstances(); // Refresh the list
        } catch (error) {
            console.error('Error terminating instance:', error);
            this.flashMessages.error('Failed to terminate workflow instance');
        }
    }

    /**
     * Manually transition a workflow instance to a specific node
     *
     * @method manualTransition
     * @param {Object} instance The workflow instance
     * @param {String} targetNodeId The target node ID
     * @public
     */
    @action async manualTransition(instance, targetNodeId) {
        try {
            await this.workflowEngine.processTransition(
                instance.id,
                instance.currentNodeId,
                targetNodeId,
                this.currentUser?.id,
                {}
            );
            
            this.flashMessages.success(`Workflow instance transitioned to new node`);
            this.loadInstances(); // Refresh the list
        } catch (error) {
            console.error('Error transitioning instance:', error);
            this.flashMessages.error('Failed to transition workflow instance');
        }
    }

    /**
     * Update workflow variables for an instance
     *
     * @method updateVariables
     * @param {Object} instance The workflow instance
     * @param {Object} variables The new variables
     * @public
     */
    @action async updateVariables(instance, variables) {
        try {
            const currentVariables = JSON.parse(instance.variables || '{}');
            const updatedVariables = { ...currentVariables, ...variables };
            
            instance.set('variables', JSON.stringify(updatedVariables));
            await instance.save();
            
            this.flashMessages.success(`Workflow variables updated`);
        } catch (error) {
            console.error('Error updating variables:', error);
            this.flashMessages.error('Failed to update workflow variables');
        }
    }

    /**
     * Refresh the instances list
     *
     * @method refreshInstances
     * @public
     */
    @action refreshInstances() {
        this.loadInstances();
    }

    /**
     * Get filtered instances based on search and status filter
     *
     * @method get filteredInstances
     * @return {Array} Filtered instances
     * @public
     */
    get filteredInstances() {
        let instances = this.instances;
        const searchTerm = this.searchTerm?.toLowerCase();
        const filterStatus = this.filterStatus;

        if (searchTerm) {
            instances = instances.filter(instance => 
                instance.entityId?.toLowerCase().includes(searchTerm) ||
                instance.entityType?.toLowerCase().includes(searchTerm)
            );
        }

        if (filterStatus !== 'all') {
            instances = instances.filter(instance => instance.status === filterStatus);
        }

        return instances;
    }

    /**
     * Get instances grouped by status
     *
     * @method get instancesByStatus
     * @return {Object} Instances grouped by status
     * @public
     */
    get instancesByStatus() {
        const grouped = {};
        this.filteredInstances.forEach(instance => {
            if (!grouped[instance.status]) {
                grouped[instance.status] = [];
            }
            grouped[instance.status].push(instance);
        });
        return grouped;
    }

    /**
     * Get progress percentage for an instance
     *
     * @method getInstanceProgress
     * @param {Object} instance The workflow instance
     * @return {Number} Progress percentage
     * @public
     */
    getInstanceProgress(instance) {
        if (instance.status === 'completed') {
            return 100;
        }
        
        if (instance.status === 'terminated') {
            return 0;
        }

        // Simple progress calculation based on node position
        // In a full implementation, this would be more sophisticated
        const definition = instance.workflowDefinition;
        if (!definition || !definition.workflowNodes) {
            return 0;
        }

        const nodes = definition.workflowNodes.toArray();
        const currentNode = nodes.find(n => n.nodeId === instance.currentNodeId);
        
        if (!currentNode) {
            return 0;
        }

        // Calculate progress based on node position in workflow
        const startNode = nodes.find(n => n.nodeType === 'start');
        const endNode = nodes.find(n => n.nodeType === 'end');
        
        if (!startNode || !endNode) {
            return 50; // Default to 50% if we can't calculate
        }

        const startIndex = nodes.indexOf(startNode);
        const endIndex = nodes.indexOf(endNode);
        const currentIndex = nodes.indexOf(currentNode);
        
        if (startIndex === -1 || endIndex === -1 || currentIndex === -1) {
            return 50;
        }

        const totalSteps = endIndex - startIndex;
        const currentStep = currentIndex - startIndex;
        
        return Math.round((currentStep / totalSteps) * 100);
    }

    /**
     * Get available transitions for an instance
     *
     * @method getAvailableTransitions
     * @param {Object} instance The workflow instance
     * @return {Array} Available transitions
     * @public
     */
    getAvailableTransitions(instance) {
        const definition = instance.workflowDefinition;
        if (!definition || !definition.workflowTransitions) {
            return [];
        }

        return definition.workflowTransitions.filter(transition => 
            transition.fromNodeId === instance.currentNodeId
        );
    }

    /**
     * Get workflow variables as an object
     *
     * @method getInstanceVariables
     * @param {Object} instance The workflow instance
     * @return {Object} Workflow variables
     * @public
     */
    getInstanceVariables(instance) {
        try {
            return JSON.parse(instance.variables || '{}');
        } catch (error) {
            console.error('Error parsing workflow variables:', error);
            return {};
        }
    }

    /**
     * Get status badge class for an instance
     *
     * @method getStatusBadgeClass
     * @param {String} status The instance status
     * @return {String} CSS class for the status badge
     * @public
     */
    getStatusBadgeClass(status) {
        switch (status) {
            case 'active':
                return 'badge-success';
            case 'completed':
                return 'badge-info';
            case 'suspended':
                return 'badge-warning';
            case 'terminated':
                return 'badge-danger';
            default:
                return 'badge-default';
        }
    }

    /**
     * Get status display text
     *
     * @method getStatusText
     * @param {String} status The instance status
     * @return {String} Display text for the status
     * @public
     */
    getStatusText(status) {
        switch (status) {
            case 'active':
                return 'Active';
            case 'completed':
                return 'Completed';
            case 'suspended':
                return 'Suspended';
            case 'terminated':
                return 'Terminated';
            default:
                return status;
        }
    }
} 