/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';

/**
 * The workflow engine service handles workflow execution and management
 *
 * @class WorkflowEngineService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class WorkflowEngineService extends Service {
    @service store;
    @service workflowRules;
    @service flashMessages;

    /**
     * Execute a workflow for a given entity
     *
     * @method executeWorkflow
     * @param {String} definitionId The workflow definition ID
     * @param {String} entityId The entity ID
     * @param {String} entityType The entity type (issue, project, etc.)
     * @param {String} userId The user ID executing the workflow
     * @return {Promise} Promise that resolves to the workflow instance
     * @public
     */
    async executeWorkflow(definitionId, entityId, entityType, userId) {
        try {
            // Load the workflow definition
            const definition = await this.store.findRecord('workflow-definition', definitionId);
            
            if (!definition.isActive) {
                throw new Error('Workflow definition is not active');
            }

            // Create a new workflow instance
            const instance = this.store.createRecord('workflow-instance', {
                workflowDefinitionId: definitionId,
                entityType,
                entityId,
                status: 'active',
                startedAt: new Date().toISOString(),
                variables: JSON.stringify({}),
                createdUser: userId,
                modifiedUser: userId
            });

            // Find the start node
            const startNode = definition.workflowNodes.find(node => node.nodeType === 'start');
            if (!startNode) {
                throw new Error('No start node found in workflow definition');
            }

            instance.set('currentNodeId', startNode.nodeId);
            await instance.save();

            // Execute rules for the start node
            await this.workflowRules.executeRulesForNode(definitionId, startNode.nodeId, {
                instance,
                entityId,
                entityType,
                userId
            });

            return instance;
        } catch (error) {
            console.error('Error executing workflow:', error);
            throw error;
        }
    }

    /**
     * Process a transition between workflow nodes
     *
     * @method processTransition
     * @param {String} instanceId The workflow instance ID
     * @param {String} fromNodeId The source node ID
     * @param {String} toNodeId The target node ID
     * @param {String} userId The user ID making the transition
     * @param {Object} variables Additional variables for the transition
     * @return {Promise} Promise that resolves to the updated instance
     * @public
     */
    async processTransition(instanceId, fromNodeId, toNodeId, userId, variables = {}) {
        try {
            const instance = await this.store.findRecord('workflow-instance', instanceId);
            
            // Validate the transition
            const isValid = await this.validateTransition(fromNodeId, toNodeId, userId, instance.entityType);
            if (!isValid) {
                throw new Error('Invalid transition');
            }

            // Update instance with new node and variables
            const currentVariables = JSON.parse(instance.variables || '{}');
            const updatedVariables = { ...currentVariables, ...variables };
            
            instance.setProperties({
                currentNodeId: toNodeId,
                variables: JSON.stringify(updatedVariables),
                modifiedUser: userId,
                dateModified: new Date().toISOString()
            });

            await instance.save();

            // Execute rules for the new node
            await this.workflowRules.executeRulesForNode(instance.workflowDefinitionId, toNodeId, {
                instance,
                entityId: instance.entityId,
                entityType: instance.entityType,
                userId,
                variables: updatedVariables
            });

            // Check if this is an end node
            const definition = await this.store.findRecord('workflow-definition', instance.workflowDefinitionId);
            const targetNode = definition.workflowNodes.find(node => node.nodeId === toNodeId);
            
            if (targetNode && targetNode.nodeType === 'end') {
                instance.setProperties({
                    status: 'completed',
                    completedAt: new Date().toISOString()
                });
                await instance.save();
            }

            return instance;
        } catch (error) {
            console.error('Error processing transition:', error);
            throw error;
        }
    }

    /**
     * Evaluate conditions for a workflow rule
     *
     * @method evaluateConditions
     * @param {String} conditions JSON string of conditions
     * @param {Object} context The context for evaluation
     * @return {Boolean} True if conditions are met
     * @public
     */
    evaluateConditions(conditions, context) {
        try {
            const conditionRules = JSON.parse(conditions || '{}');
            
            // Simple condition evaluation - can be extended for complex logic
            for (const [field, rule] of Object.entries(conditionRules)) {
                const value = this.getNestedValue(context, field);
                
                if (rule.operator === 'equals' && value !== rule.value) {
                    return false;
                }
                if (rule.operator === 'not_equals' && value === rule.value) {
                    return false;
                }
                if (rule.operator === 'contains' && !value?.includes(rule.value)) {
                    return false;
                }
                if (rule.operator === 'greater_than' && value <= rule.value) {
                    return false;
                }
                if (rule.operator === 'less_than' && value >= rule.value) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error evaluating conditions:', error);
            return false;
        }
    }

    /**
     * Execute actions for a workflow rule
     *
     * @method executeActions
     * @param {String} actions JSON string of actions
     * @param {Object} context The context for execution
     * @return {Promise} Promise that resolves when actions are completed
     * @public
     */
    async executeActions(actions, context) {
        try {
            const actionList = JSON.parse(actions || '[]');
            
            for (const action of actionList) {
                switch (action.type) {
                    case 'assign_task':
                        await this.assignTask(action.userId, context.entityId, context.entityType);
                        break;
                    case 'send_notification':
                        await this.sendNotification(action.recipients, action.message, context);
                        break;
                    case 'update_status':
                        await this.updateEntityStatus(context.entityId, context.entityType, action.status);
                        break;
                    case 'set_field':
                        await this.setEntityField(context.entityId, context.entityType, action.field, action.value);
                        break;
                    default:
                        console.warn(`Unknown action type: ${action.type}`);
                }
            }
        } catch (error) {
            console.error('Error executing actions:', error);
            throw error;
        }
    }

    /**
     * Send notification to recipients
     *
     * @method sendNotification
     * @param {Array} recipients Array of user IDs
     * @param {String} message The notification message
     * @param {Object} context The context for the notification
     * @return {Promise} Promise that resolves when notification is sent
     * @public
     */
    async sendNotification(recipients, message, context) {
        try {
            // This would integrate with the existing notification system
            console.log(`Sending notification to ${recipients.length} recipients: ${message}`);
            
            // Placeholder for actual notification implementation
            // await this.notificationService.send(recipients, message, context);
            
            this.flashMessages?.success('Notification sent successfully');
        } catch (error) {
            console.error('Error sending notification:', error);
            this.flashMessages?.error('Failed to send notification');
        }
    }

    /**
     * Assign task to a user
     *
     * @method assignTask
     * @param {String} userId The user ID to assign the task to
     * @param {String} entityId The entity ID
     * @param {String} entityType The entity type
     * @return {Promise} Promise that resolves when task is assigned
     * @public
     */
    async assignTask(userId, entityId, entityType) {
        try {
            const entity = await this.store.findRecord(entityType, entityId);
            entity.set('assignee', userId);
            await entity.save();
            
            this.flashMessages?.success('Task assigned successfully');
        } catch (error) {
            console.error('Error assigning task:', error);
            this.flashMessages?.error('Failed to assign task');
        }
    }

    /**
     * Validate a transition between workflow nodes
     *
     * @method validateTransition
     * @param {String} fromStatus The current status
     * @param {String} toStatus The target status
     * @param {String} userId The user ID
     * @param {String} entityType The entity type
     * @return {Boolean} True if transition is valid
     * @public
     */
    async validateTransition(fromStatus, toStatus, userId, entityType) {
        try {
            // Load transition rules and validate
            const transitions = await this.store.query('workflow-transition', {
                fromNodeId: fromStatus,
                toNodeId: toStatus
            });

            for (const transition of transitions) {
                if (transition.conditions) {
                    const context = { userId, entityType };
                    const isValid = this.evaluateConditions(transition.conditions, context);
                    if (!isValid) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error validating transition:', error);
            return false;
        }
    }

    /**
     * Get nested value from object using dot notation
     *
     * @method getNestedValue
     * @param {Object} obj The object to search
     * @param {String} path The dot notation path
     * @return {*} The value at the path
     * @private
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Update entity status
     *
     * @method updateEntityStatus
     * @param {String} entityId The entity ID
     * @param {String} entityType The entity type
     * @param {String} status The new status
     * @return {Promise} Promise that resolves when status is updated
     * @private
     */
    async updateEntityStatus(entityId, entityType, status) {
        try {
            const entity = await this.store.findRecord(entityType, entityId);
            entity.set('status', status);
            await entity.save();
        } catch (error) {
            console.error('Error updating entity status:', error);
        }
    }

    /**
     * Set entity field value
     *
     * @method setEntityField
     * @param {String} entityId The entity ID
     * @param {String} entityType The entity type
     * @param {String} field The field name
     * @param {*} value The field value
     * @return {Promise} Promise that resolves when field is updated
     * @private
     */
    async setEntityField(entityId, entityType, field, value) {
        try {
            const entity = await this.store.findRecord(entityType, entityId);
            entity.set(field, value);
            await entity.save();
        } catch (error) {
            console.error('Error setting entity field:', error);
        }
    }
} 