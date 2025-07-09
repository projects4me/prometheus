/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Create Workflow Controller for Project
 * Handles workflow creation form and actions
 *
 * @class AppProjectWorkflowsCreateController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 */
export default class AppProjectWorkflowsCreateController extends Controller {
    @service store;
    @service router;
    @service flashMessages;
    @service currentUser;
    @service acl;

    @tracked isLoading = false;
    @tracked errors = [];

    /**
     * Check if user can create workflows
     *
     * @method get canCreateWorkflow
     * @return {Boolean} Whether user can create workflows
     * @public
     */
    get canCreateWorkflow() {
        return this.acl.checkAccess('App.Project.Workflow.Create');
    }

    /**
     * Save the workflow
     *
     * @method saveWorkflow
     * @param {Object} workflowData The workflow data to save
     * @public
     */
    @action async saveWorkflow(workflowData) {
        if (!this.canCreateWorkflow) {
            this.flashMessages.error('You do not have permission to create workflows');
            return;
        }

        this.isLoading = true;
        this.errors = [];

        try {
            // Validate required fields
            if (!workflowData.name || workflowData.name.trim().length === 0) {
                throw new Error('Workflow name is required');
            }

            // Update workflow with form data
            const workflow = this.model.workflow;
            workflow.setProperties({
                name: workflowData.name.trim(),
                description: workflowData.description?.trim() || '',
                version: workflowData.version || '1.0',
                isActive: workflowData.isActive !== false,
                isSystem: workflowData.isSystem === true,
                modifiedUser: this.currentUser.user?.id
            });

            // Save the workflow
            await workflow.save();

            this.flashMessages.success(`Workflow "${workflow.name}" created successfully`);
            
            // Trigger route action
            this.send('workflowCreated', workflow);
        } catch (error) {
            console.error('Error creating workflow:', error);
            
            this.errors = [error.message || 'Failed to create workflow'];
            this.flashMessages.error('Failed to create workflow');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Cancel workflow creation
     *
     * @method cancelCreate
     * @public
     */
    @action cancelCreate() {
        // Rollback the unsaved workflow
        this.model.workflow.rollbackAttributes();
        
        // Trigger route action
        this.send('cancelCreate');
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

    /**
     * Handle form field changes
     *
     * @method updateField
     * @param {String} field The field name
     * @param {Any} value The field value
     * @public
     */
    @action updateField(field, value) {
        this.model.workflow.set(field, value);
        
        // Clear errors when user starts typing
        if (this.errors.length > 0) {
            this.clearErrors();
        }
    }

    /**
     * Validate workflow name uniqueness
     *
     * @method validateWorkflowName
     * @param {String} name The workflow name to validate
     * @public
     */
    @action async validateWorkflowName(name) {
        if (!name || name.trim().length === 0) {
            return;
        }

        try {
            const existingWorkflows = await this.store.query('workflow-definition', {
                filter: {
                    name: name.trim(),
                    project: this.model.project.id
                }
            });

            if (existingWorkflows.length > 0) {
                this.errors = ['A workflow with this name already exists in this project'];
            }
        } catch (error) {
            console.error('Error validating workflow name:', error);
        }
    }
}
