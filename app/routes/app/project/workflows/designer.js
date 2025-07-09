/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Workflow Designer Route for Project
 * Handles the visual workflow designer interface
 *
 * @class AppProjectWorkflowsDesignerRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 */
export default class AppProjectWorkflowsDesignerRoute extends Route {
    @service store;
    @service router;
    @service currentUser;

    /**
     * Load the model data for the workflow designer
     * 
     * @method model
     * @param {Object} params Route parameters
     * @return {Object} Model object containing project, workflow, and related data
     */
    async model(params) {
        const project = this.modelFor('app.project');
        
        if (!project) {
            this.router.transitionTo('app.projects');
            return;
        }

        try {
            // Load the workflow with all related data
            const workflow = await this.store.findRecord('workflow-definition', params.workflow_id, {
                include: 'workflowNodes,workflowTransitions,workflowRules'
            });

            // Verify workflow belongs to current project
            if (workflow.projectId !== project.id) {
                throw new Error('Workflow not found in this project');
            }

            // Load additional data needed for the designer
            const [issueTypes, issueStatuses, projectMembers] = await Promise.all([
                this.store.findAll('issuetype'),
                this.store.findAll('issuestatus'),
                project.members
            ]);

            return {
                project,
                workflow,
                issueTypes,
                issueStatuses,
                projectMembers
            };
        } catch (error) {
            console.error('Error loading workflow for designer:', error);
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
            isLoading: false,
            errors: [],
            hasUnsavedChanges: false
        });
    }

    /**
     * Handle loading state
     * 
     * @method loading
     * @param {Object} transition The route transition
     */
    loading(transition) {
        const controller = this.controllerFor('app.project.workflows.designer');
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
        console.error('Workflow designer route error:', error);
        this.router.transitionTo('app.project.workflows.index');
        return true;
    }

    /**
     * Actions for the route
     */
    actions = {
        /**
         * Handle successful workflow save
         * 
         * @param {Object} workflow The saved workflow
         */
        workflowSaved(workflow) {
            const controller = this.controllerFor('app.project.workflows.designer');
            controller.set('hasUnsavedChanges', false);
        },

        /**
         * Navigate back to workflow list
         */
        backToList() {
            this.router.transitionTo('app.project.workflows.index');
        },

        /**
         * Navigate to workflow edit
         * 
         * @param {Object} workflow The workflow to edit
         */
        editWorkflow(workflow) {
            this.router.transitionTo('app.project.workflows.edit', workflow.id);
        },

        /**
         * Handle errors during workflow operations
         * 
         * @param {Error} error The error that occurred
         */
        error(error) {
            console.error('Workflow designer error:', error);
            
            const controller = this.controllerFor('app.project.workflows.designer');
            controller.set('errors', [error.message || 'An error occurred in the workflow designer']);
        }
    };
}
