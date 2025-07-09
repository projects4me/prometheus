/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Edit Workflow Controller for Project
 * Handles workflow editing form and actions
 *
 * @class AppProjectWorkflowsEditController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 */
export default class AppProjectWorkflowsEditController extends Controller {
    @service store;
    @service router;
    @service flashMessages;
    @service currentUser;
    @service acl;

    @tracked isLoading = false;
    @tracked errors = [];
    @tracked originalWorkflow = null;

    /**
     * Check if user can edit workflows
     *
     * @method get canEditWorkflow
     * @return {Boolean} Whether user can edit workflows
     * @public
     */
    get canEditWorkflow() {
        return this.acl.checkAccess('App.Project.Workflow.Edit');
    }

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
     * Check if user can monitor workflow instances
     *
     * @method get canMonitorWorkflow
     * @return {Boolean} Whether user can monitor workflow instances
     * @public
     */
    get canMonitorWorkflow() {
        return this.acl.checkAccess('App.Project.Workflow.Monitor');
    }

    /**
     * Check if workflow has unsaved changes
     *
     * @method get hasUnsavedChanges
     * @return {Boolean} Whether workflow has unsaved changes
     * @public
     */
    get hasUnsavedChanges() {
        const workflow = this.model?.workflow;
        if (!workflow || !this.originalWorkflow) {
            return false;
        }

        return workflow.hasDirtyAttributes;
    }

    /**
     * Check if workflow can be deleted (not system workflow and no active instances)
     *
     * @method get canDeleteWorkflow
     * @return {Boolean} Whether workflow can be deleted
     * @public
     */
    get canDeleteWorkflow() {
        const workflow = this.model?.workflow;
        if (!workflow) {
            return false;
        }

        return !workflow.isSystem && 
               this.acl.checkAccess('App.Project.Workflow.Edit') &&
               (!workflow.workflowInstances || workflow.workflowInstances.length === 0);
    }

    /**
     * Save the workflow
     *
     * @method saveWorkflow
     * @param {Object} workflowData The workflow data to save
     * @public
     */
    @action async saveWorkflow(workflowData) {
        if (!this.canEditWorkflow) {
            this.flashMessages.error('You do not have permission to edit workflows');
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
                version: workflowData.version || workflow.version,
                isActive: workflowData.isActive !== false,
                isSystem: workflowData.isSystem === true,
                modifiedUser: this.currentUser.user?.id
            });

            // Save the workflow
            await workflow.save();

            this.flashMessages.success(`Workflow "${workflow.name}" updated successfully`);
            
            // Update original workflow for change detection
            this.originalWorkflow = workflow.toJSON();
            
            // Trigger route action
            this.send('workflowUpdated', workflow);
        } catch (error) {
            console.error('Error updating workflow:', error);
            
            this.errors = [error.message || 'Failed to update workflow'];
            this.flashMessages.error('Failed to update workflow');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Cancel workflow editing
     *
     * @method cancelEdit
     * @public
     */
    @action cancelEdit() {
        // Trigger route action (will handle rollback)
        this.send('cancelEdit');
    }

    /**
     * Navigate to workflow designer
     *
     * @method designWorkflow
     * @public
     */
    @action designWorkflow() {
        if (!this.canDesignWorkflow) {
            this.flashMessages.error('You do not have permission to design workflows');
            return;
        }

        this.send('designWorkflow', this.model.workflow);
    }

    /**
     * Navigate to workflow instances
     *
     * @method viewInstances
     * @public
     */
    @action viewInstances() {
        if (!this.canMonitorWorkflow) {
            this.flashMessages.error('You do not have permission to monitor workflows');
            return;
        }

        this.send('viewInstances', this.model.workflow);
    }

    /**
     * Delete workflow
     *
     * @method deleteWorkflow
     * @public
     */
    @action async deleteWorkflow() {
        if (!this.canDeleteWorkflow) {
            this.flashMessages.error('This workflow cannot be deleted');
            return;
        }

        const workflow = this.model.workflow;
        const confirmMessage = `Are you sure you want to delete workflow "${workflow.name}"? This action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        this.isLoading = true;

        try {
            await workflow.destroyRecord();
            
            this.flashMessages.success(`Workflow "${workflow.name}" deleted successfully`);
            this.router.transitionTo('app.project.workflows.index');
        } catch (error) {
            console.error('Error deleting workflow:', error);
            this.flashMessages.error('Failed to delete workflow');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Duplicate workflow
     *
     * @method duplicateWorkflow
     * @public
     */
    @action async duplicateWorkflow() {
        if (!this.acl.checkAccess('App.Project.Workflow.Create')) {
            this.flashMessages.error('You do not have permission to create workflows');
            return;
        }

        this.isLoading = true;

        try {
            const originalWorkflow = this.model.workflow;
            const newWorkflow = this.store.createRecord('workflow-definition', {
                name: `${originalWorkflow.name} (Copy)`,
                description: originalWorkflow.description,
                version: originalWorkflow.version,
                projectId: originalWorkflow.projectId,
                isActive: false,
                isSystem: false,
                bpmnXml: originalWorkflow.bpmnXml,
                createdUser: this.currentUser.user?.id,
                modifiedUser: this.currentUser.user?.id
            });

            await newWorkflow.save();
            
            this.flashMessages.success(`Workflow "${originalWorkflow.name}" duplicated successfully`);
            this.router.transitionTo('app.project.workflows.edit', newWorkflow.id);
        } catch (error) {
            console.error('Error duplicating workflow:', error);
            this.flashMessages.error('Failed to duplicate workflow');
        } finally {
            this.isLoading = false;
        }
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

            // Check if name conflicts with other workflows (excluding current one)
            const conflictingWorkflow = existingWorkflows.find(w => 
                w.id !== this.model.workflow.id
            );

            if (conflictingWorkflow) {
                this.errors = ['A workflow with this name already exists in this project'];
            }
        } catch (error) {
            console.error('Error validating workflow name:', error);
        }
    }
}
