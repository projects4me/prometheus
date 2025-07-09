/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';

/**
 * The workflow rules service handles rule management and execution
 *
 * @class WorkflowRulesService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class WorkflowRulesService extends Service {
    @service store;
    @service workflowEngine;
    @service flashMessages;

    /**
     * Get rules for a specific node
     *
     * @method getRulesForNode
     * @param {String} workflowId The workflow definition ID
     * @param {String} nodeId The node ID
     * @return {Promise} Promise that resolves to array of rules
     * @public
     */
    async getRulesForNode(workflowId, nodeId) {
        try {
            const rules = await this.store.query('workflow-rule', {
                workflowDefinitionId: workflowId,
                nodeId,
                isActive: true
            });

            // Sort by priority (highest first)
            return rules.sortBy('priority').reverse();
        } catch (error) {
            console.error('Error getting rules for node:', error);
            return [];
        }
    }

    /**
     * Evaluate a single rule
     *
     * @method evaluateRule
     * @param {Object} rule The workflow rule object
     * @param {Object} context The context for evaluation
     * @return {Boolean} True if rule conditions are met
     * @public
     */
    evaluateRule(rule, context) {
        if (!rule.isActive) {
            return false;
        }

        return this.workflowEngine.evaluateConditions(rule.conditions, context);
    }

    /**
     * Execute actions for a rule
     *
     * @method executeRuleActions
     * @param {Object} rule The workflow rule object
     * @param {Object} context The context for execution
     * @return {Promise} Promise that resolves when actions are completed
     * @public
     */
    async executeRuleActions(rule, context) {
        try {
            await this.workflowEngine.executeActions(rule.actions, context);
            
            console.log(`Executed rule: ${rule.name}`);
        } catch (error) {
            console.error(`Error executing rule ${rule.name}:`, error);
            throw error;
        }
    }

    /**
     * Validate rule conditions
     *
     * @method validateRuleConditions
     * @param {String} conditions JSON string of conditions
     * @param {Object} context The context for validation
     * @return {Boolean} True if conditions are valid
     * @public
     */
    validateRuleConditions(conditions, context) {
        try {
            const conditionRules = JSON.parse(conditions || '{}');
            
            // Validate condition structure
            for (const [field, rule] of Object.entries(conditionRules)) {
                if (!rule.operator || !rule.hasOwnProperty('value')) {
                    return false;
                }
                
                // Validate operator
                const validOperators = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'];
                if (!validOperators.includes(rule.operator)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error validating rule conditions:', error);
            return false;
        }
    }

    /**
     * Execute all rules for a node
     *
     * @method executeRulesForNode
     * @param {String} workflowId The workflow definition ID
     * @param {String} nodeId The node ID
     * @param {Object} context The context for execution
     * @return {Promise} Promise that resolves when all rules are executed
     * @public
     */
    async executeRulesForNode(workflowId, nodeId, context) {
        try {
            const rules = await this.getRulesForNode(workflowId, nodeId);
            
            for (const rule of rules) {
                if (this.evaluateRule(rule, context)) {
                    await this.executeRuleActions(rule, context);
                }
            }
        } catch (error) {
            console.error('Error executing rules for node:', error);
            throw error;
        }
    }

    /**
     * Create a status change assignment rule
     *
     * @method createStatusChangeAssignmentRule
     * @param {String} workflowId The workflow definition ID
     * @param {String} nodeId The node ID
     * @param {String} assigneeId The user ID to assign to
     * @param {String} status The status to trigger on
     * @return {Promise} Promise that resolves to the created rule
     * @public
     */
    async createStatusChangeAssignmentRule(workflowId, nodeId, assigneeId, status) {
        try {
            const rule = this.store.createRecord('workflow-rule', {
                workflowDefinitionId: workflowId,
                nodeId,
                ruleType: 'assignment',
                name: `Assign to ${assigneeId} on ${status}`,
                description: `Automatically assign task to user when status changes to ${status}`,
                conditions: JSON.stringify({
                    'status': {
                        operator: 'equals',
                        value: status
                    }
                }),
                actions: JSON.stringify([
                    {
                        type: 'assign_task',
                        userId: assigneeId
                    }
                ]),
                priority: 1,
                isActive: true,
                createdUser: this.currentUser?.id,
                modifiedUser: this.currentUser?.id
            });

            await rule.save();
            return rule;
        } catch (error) {
            console.error('Error creating status change assignment rule:', error);
            throw error;
        }
    }

    /**
     * Create a due date notification rule
     *
     * @method createDueDateNotificationRule
     * @param {String} workflowId The workflow definition ID
     * @param {String} nodeId The node ID
     * @param {Array} recipients Array of user IDs to notify
     * @param {Number} daysBefore Number of days before due date to send notification
     * @return {Promise} Promise that resolves to the created rule
     * @public
     */
    async createDueDateNotificationRule(workflowId, nodeId, recipients, daysBefore = 1) {
        try {
            const rule = this.store.createRecord('workflow-rule', {
                workflowDefinitionId: workflowId,
                nodeId,
                ruleType: 'notification',
                name: `Due Date Notification (${daysBefore} day${daysBefore > 1 ? 's' : ''} before)`,
                description: `Send notification ${daysBefore} day${daysBefore > 1 ? 's' : ''} before due date`,
                conditions: JSON.stringify({
                    'dueDate': {
                        operator: 'less_than',
                        value: new Date(Date.now() + daysBefore * 24 * 60 * 60 * 1000).toISOString()
                    }
                }),
                actions: JSON.stringify([
                    {
                        type: 'send_notification',
                        recipients,
                        message: `Task is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''}`
                    }
                ]),
                priority: 2,
                isActive: true,
                createdUser: this.currentUser?.id,
                modifiedUser: this.currentUser?.id
            });

            await rule.save();
            return rule;
        } catch (error) {
            console.error('Error creating due date notification rule:', error);
            throw error;
        }
    }

    /**
     * Create a role-based validation rule
     *
     * @method createRoleBasedValidationRule
     * @param {String} workflowId The workflow definition ID
     * @param {String} nodeId The node ID
     * @param {String} requiredRole The required role for the transition
     * @param {String} errorMessage The error message if validation fails
     * @return {Promise} Promise that resolves to the created rule
     * @public
     */
    async createRoleBasedValidationRule(workflowId, nodeId, requiredRole, errorMessage) {
        try {
            const rule = this.store.createRecord('workflow-rule', {
                workflowDefinitionId: workflowId,
                nodeId,
                ruleType: 'validation',
                name: `Role-based validation for ${requiredRole}`,
                description: `Ensure user has ${requiredRole} role to proceed`,
                conditions: JSON.stringify({
                    'user.role': {
                        operator: 'equals',
                        value: requiredRole
                    }
                }),
                actions: JSON.stringify([
                    {
                        type: 'validation_error',
                        message: errorMessage
                    }
                ]),
                priority: 3,
                isActive: true,
                createdUser: this.currentUser?.id,
                modifiedUser: this.currentUser?.id
            });

            await rule.save();
            return rule;
        } catch (error) {
            console.error('Error creating role-based validation rule:', error);
            throw error;
        }
    }

    /**
     * Get example rules for demonstration
     *
     * @method getExampleRules
     * @return {Array} Array of example rule configurations
     * @public
     */
    getExampleRules() {
        return [
            {
                name: 'Status Change Assignment',
                description: 'Automatically assign task when status changes to "In Progress"',
                ruleType: 'assignment',
                conditions: {
                    'status': {
                        operator: 'equals',
                        value: 'in_progress'
                    }
                },
                actions: [
                    {
                        type: 'assign_task',
                        userId: 'current_user'
                    }
                ]
            },
            {
                name: 'Due Date Notification',
                description: 'Send notification 1 day before due date',
                ruleType: 'notification',
                conditions: {
                    'dueDate': {
                        operator: 'less_than',
                        value: '1_day_from_now'
                    }
                },
                actions: [
                    {
                        type: 'send_notification',
                        recipients: ['assignee'],
                        message: 'Task is due tomorrow'
                    }
                ]
            },
            {
                name: 'Role-based Validation',
                description: 'Ensure only managers can approve tasks',
                ruleType: 'validation',
                conditions: {
                    'user.role': {
                        operator: 'equals',
                        value: 'manager'
                    }
                },
                actions: [
                    {
                        type: 'validation_error',
                        message: 'Only managers can approve this task'
                    }
                ]
            }
        ];
    }

    /**
     * Validate a rule configuration
     *
     * @method validateRule
     * @param {Object} rule The rule configuration
     * @return {Object} Validation result with isValid and errors
     * @public
     */
    validateRule(rule) {
        const errors = [];

        if (!rule.name) {
            errors.push('Rule name is required');
        }

        if (!rule.ruleType) {
            errors.push('Rule type is required');
        }

        if (!rule.conditions || Object.keys(rule.conditions).length === 0) {
            errors.push('At least one condition is required');
        }

        if (!rule.actions || rule.actions.length === 0) {
            errors.push('At least one action is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 