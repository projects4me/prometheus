/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from "prometheus/controllers/prometheus/list";
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

/**
 * This controller is used to provide the interaction between the template and
 * the route for workflow management. The basic features that this controller provide are pagination,
 * sorting and filtering the data.
 *
 * @class AppProjectWorkflowsIndexController
 * @namespace Prometheus.Controllers
 * @module App.Project.Workflows
 * @extends PrometheusListController
 */
export default class AppProjectWorkflowsIndexController extends PrometheusListController {
    @service store;
    @service router;
    @service flashMessages;
    @service acl;

    @controller('app.project.index')
    appProjectIndexController;

    /**
     * This object holds all of the information that we need to create our schema and handle filtering
     * rules for the workflows list.
     * @property metadata
     * @type Object
     * @for AppProjectWorkflowsIndexController
     * @protected
     */
    metadata = {
        filters: [
            {
                id: 'WorkflowDefinition.name',
                label: 'Name',
                type: 'string'
            },
            {
                id: 'WorkflowDefinition.description',
                label: 'Description',
                type: 'string'
            },
            {
                id: 'WorkflowDefinition.version',
                label: 'Version',
                type: 'string'
            },
            {
                id: 'WorkflowDefinition.isActive',
                label: 'Status',
                type: 'boolean',
                input: 'select',
                values: [
                    { value: true, label: 'Active' },
                    { value: false, label: 'Inactive' }
                ]
            },
            {
                id: 'WorkflowDefinition.isSystem',
                label: 'System Workflow',
                type: 'boolean',
                input: 'select',
                values: [
                    { value: true, label: 'System' },
                    { value: false, label: 'Custom' }
                ]
            }
        ]
    };

    /**
     * This property stores the field on which the page is currently sorted
     *
     * @property sort
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    sort = 'WorkflowDefinition.name';

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
     * Navigate to create new workflow
     *
     * @method createWorkflow
     * @public
     */
    @action createWorkflow() {
        this.router.transitionTo('app.project.workflows.create');
    }

    /**
     * Navigate to edit workflow
     *
     * @method editWorkflow
     * @param {Object} workflow The workflow to edit
     * @public
     */
    @action editWorkflow(workflow) {
        this.router.transitionTo('app.project.workflows.edit', workflow.id);
    }

    /**
     * Navigate to workflow designer
     *
     * @method designWorkflow
     * @param {Object} workflow The workflow to design
     * @public
     */
    @action designWorkflow(workflow) {
        this.router.transitionTo('app.project.workflows.designer', workflow.id);
    }

    /**
     * Navigate to workflow instances
     *
     * @method viewInstances
     * @param {Object} workflow The workflow to view instances for
     * @public
     */
    @action viewInstances(workflow) {
        this.router.transitionTo('app.project.workflows.instances', workflow.id);
    }

    /**
     * Toggle workflow active status
     *
     * @method toggleWorkflowStatus
     * @param {Object} workflow The workflow to toggle
     * @public
     */
    @action async toggleWorkflowStatus(workflow) {
        try {
            workflow.set('isActive', !workflow.isActive);
            await workflow.save();
            
            this.flashMessages.success(
                `Workflow "${workflow.name}" ${workflow.isActive ? 'activated' : 'deactivated'} successfully`
            );
        } catch (error) {
            console.error('Error toggling workflow status:', error);
            workflow.rollbackAttributes();
            
            this.flashMessages.error('Failed to update workflow status');
        }
    }

    /**
     * Delete workflow
     *
     * @method deleteWorkflow
     * @param {Object} workflow The workflow to delete
     * @public
     */
    @action async deleteWorkflow(workflow) {
        if (confirm(`Are you sure you want to delete workflow "${workflow.name}"?`)) {
            try {
                await workflow.destroyRecord();
                
                this.flashMessages.success(`Workflow "${workflow.name}" deleted successfully`);
                
                // Refresh the model to update the list
                this.send('refreshWorkflows');
            } catch (error) {
                console.error('Error deleting workflow:', error);
                this.flashMessages.error('Failed to delete workflow');
            }
        }
    }

    /**
     * Duplicate workflow
     *
     * @method duplicateWorkflow
     * @param {Object} workflow The workflow to duplicate
     * @public
     */
    @action async duplicateWorkflow(workflow) {
        try {
            const newWorkflow = this.store.createRecord('workflow-definition', {
                name: `${workflow.name} (Copy)`,
                description: workflow.description,
                version: workflow.version,
                projectId: workflow.projectId,
                isActive: false,
                isSystem: false,
                bpmnXml: workflow.bpmnXml,
                createdUser: this.currentUser?.id,
                modifiedUser: this.currentUser?.id
            });

            await newWorkflow.save();
            
            this.flashMessages.success(`Workflow "${workflow.name}" duplicated successfully`);
            
            // Navigate to edit the new workflow
            this.router.transitionTo('app.project.workflows.edit', newWorkflow.id);
        } catch (error) {
            console.error('Error duplicating workflow:', error);
            this.flashMessages.error('Failed to duplicate workflow');
        }
    }

    /**
     * Export workflow
     *
     * @method exportWorkflow
     * @param {Object} workflow The workflow to export
     * @public
     */
    @action exportWorkflow(workflow) {
        try {
            const workflowData = {
                name: workflow.name,
                description: workflow.description,
                version: workflow.version,
                bpmnXml: workflow.bpmnXml,
                nodes: workflow.workflowNodes?.toArray() || [],
                transitions: workflow.workflowTransitions?.toArray() || [],
                rules: workflow.workflowRules?.toArray() || []
            };

            const dataStr = JSON.stringify(workflowData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            
            this.flashMessages.success(`Workflow "${workflow.name}" exported successfully`);
        } catch (error) {
            console.error('Error exporting workflow:', error);
            this.flashMessages.error('Failed to export workflow');
        }
    }

    /**
     * Get filtered workflows based on search term and status filter
     *
     * @method get filteredWorkflows
     * @return {Array} Filtered workflows
     * @public
     */
    get filteredWorkflows() {
        let workflows = this.model?.workflows || [];
        const searchTerm = this.searchTerm?.toLowerCase();
        const filterStatus = this.filterStatus;

        if (searchTerm) {
            workflows = workflows.filter(workflow => 
                workflow.name?.toLowerCase().includes(searchTerm) ||
                workflow.description?.toLowerCase().includes(searchTerm)
            );
        }

        if (filterStatus !== 'all') {
            const isActive = filterStatus === 'active';
            workflows = workflows.filter(workflow => workflow.isActive === isActive);
        }

        return workflows;
    }

    /**
     * Get sorted workflows
     *
     * @method get sortedWorkflows
     * @return {Array} Sorted workflows
     * @public
     */
    get sortedWorkflows() {
        const workflows = this.filteredWorkflows;
        const sortBy = this.sortBy;
        const sortDirection = this.sortDirection;

        return workflows.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
}
