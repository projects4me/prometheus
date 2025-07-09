/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Edit Workflow Route for Project
 * Handles workflow editing
 *
 * @class AppProjectWorkflowsEditRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 */
export default class AppProjectWorkflowsEditRoute extends Route {
    @service store;
    @service router;
    @service currentUser;

    /**
     * Load the model data for editing a workflow
     * 
     * @method model
     * @param {Object} params Route parameters
     * @return {Object} Model object containing project and workflow
     */
    async model(params) {
        const project = this.modelFor('app.project');
        
        if (!project) {
            this.router.transitionTo('app.projects');
            return;
        }

        try {
            // Load the workflow with related data
            const workflow = await this.store.findRecord('workflow-definition', params.workflow_id, {
                include: 'workflowNodes,workflowTransitions,workflowRules'
            });

            // Verify workflow belongs to current project
            if (workflow.projectId !== project.id) {
                throw new Error('Workflow not found in this project');
            }

            return {
                project,
                workflow
            };
        } catch (error) {
            console.error('Error loading workflow:', error);
            this.router.transitionTo('app.project.workflows.index');
            return;
        }
    }

    /**
     * Setup controller with additional properties
     * 
     * @method setupController
     * @param {Object} controller The route controller
     * @param {Object} model The resolved model
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        
        controller.setProperties({
            isEditing: true,
            isLoading: false,
            errors: [],
            originalWorkflow: model.workflow.toJSON()
        });
    }

    /**
     * Handle loading state
     * 
     * @method loading
     * @param {Object} transition The route transition
     */
    loading(transition) {
        const controller = this.controllerFor('app.project.workflows.edit');
        controller.set('isLoading', true);
        return true;
    }

    /**
     * Handle errors during route loading
     * 
     * @method error
     * @param {Error} error The error that occurred
     * @param {Object} transition The route transition
     */
    error(error, transition) {
        console.error('Workflow edit route error:', error);
        this.router.transitionTo('app.project.workflows.index');
        return true;
    }

    /**
     * Actions for the route
     */
    actions = {
        /**
         * Handle successful workflow update
         * 
         * @param {Object} workflow The updated workflow
         */
        workflowUpdated(workflow) {
            this.router.transitionTo('app.project.workflows.index');
        },

        /**
         * Handle workflow update cancellation
         */
        cancelEdit() {
            const controller = this.controllerFor('app.project.workflows.edit');
            const workflow = controller.model.workflow;
            
            // Rollback changes
            workflow.rollbackAttributes();
            
            this.router.transitionTo('app.project.workflows.index');
        },

        /**
         * Navigate to workflow designer
         * 
         * @param {Object} workflow The workflow to design
         */
        designWorkflow(workflow) {
            this.router.transitionTo('app.project.workflows.designer', workflow.id);
        },

        /**
         * Navigate to workflow instances
         * 
         * @param {Object} workflow The workflow to view instances for
         */
        viewInstances(workflow) {
            this.router.transitionTo('app.project.workflows.instances', workflow.id);
        },

        /**
         * Handle errors during workflow update
         * 
         * @param {Error} error The error that occurred
         */
        error(error) {
            console.error('Workflow update error:', error);
            
            const controller = this.controllerFor('app.project.workflows.edit');
            controller.set('errors', [error.message || 'Failed to update workflow']);
        }
    };
}
