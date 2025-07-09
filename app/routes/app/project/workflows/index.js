/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Workflows List Route for Project
 * Loads workflow definitions for the current project
 *
 * @class AppProjectWorkflowsIndexRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 */
export default class AppProjectWorkflowsIndexRoute extends Route {
    @service store;
    @service router;
    @service trackedProject;

    /**
     * Load the model data for workflows
     * 
     * @method model
     * @return {Object} Model object containing project and workflows
     */
    async model() {
        const project = this.modelFor('app.project');
        
        if (!project) {
            this.router.transitionTo('app.projects');
            return;
        }

        try {
            // Load workflow definitions for the project
            const workflows = await this.store.query('workflow-definition', {
                project: project.id,
                include: 'workflowNodes,workflowTransitions,workflowInstances,workflowRules'
            });

            return {
                project,
                workflows
            };
        } catch (error) {
            console.error('Error loading workflows:', error);
            
            // Fallback to basic project data
            return {
                project,
                workflows: [],
                error: 'Failed to load workflows'
            };
        }
    }

    /**
     * Setup controller with additional properties and actions
     * 
     * @method setupController
     * @param {Object} controller The route controller
     * @param {Object} model The resolved model
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        
        // Set loading state
        controller.set('isLoading', false);
        
        // Set up workflow list specific properties
        controller.setProperties({
            searchTerm: '',
            filterStatus: 'all',
            sortBy: 'name',
            sortDirection: 'asc'
        });
    }

    /**
     * Handle loading state
     * 
     * @method loading
     * @param {Object} transition The route transition
     */
    loading(transition) {
        const controller = this.controllerFor('app.project.workflows.index');
        controller.set('isLoading', true);
        return true; // Allow the loading template to be shown
    }

    /**
     * Handle errors during route loading
     * 
     * @method error
     * @param {Error} error The error that occurred
     * @param {Object} transition The route transition
     */
    error(error, transition) {
        console.error('Workflows route error:', error);
        
        const controller = this.controllerFor('app.project.workflows.index');
        controller.setProperties({
            isLoading: false,
            error: 'Failed to load workflows. Please try again.'
        });
        
        return true; // Allow the error to be handled by the error template
    }

    /**
     * Actions for the route
     */
    actions = {
        /**
         * Refresh the workflows data
         */
        refreshWorkflows() {
            this.refresh();
        },

        /**
         * Navigate to create new workflow
         */
        createWorkflow() {
            this.router.transitionTo('app.project.workflows.create');
        },

        /**
         * Navigate to edit workflow
         * 
         * @param {Object} workflow The workflow to edit
         */
        editWorkflow(workflow) {
            this.router.transitionTo('app.project.workflows.edit', workflow.id);
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
        }
    };
} 