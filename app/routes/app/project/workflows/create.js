/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Create Workflow Route for Project
 * Handles workflow creation
 *
 * @class AppProjectWorkflowsCreateRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 */
export default class AppProjectWorkflowsCreateRoute extends Route {
    @service store;
    @service router;
    @service currentUser;

    /**
     * Load the model data for creating a new workflow
     * 
     * @method model
     * @return {Object} Model object containing project and new workflow
     */
    async model() {
        const project = this.modelFor('app.project');
        
        if (!project) {
            this.router.transitionTo('app.projects');
            return;
        }

        // Create a new workflow definition
        const workflow = this.store.createRecord('workflow-definition', {
            projectId: project.id,
            version: '1.0',
            isActive: true,
            isSystem: false,
            createdUser: this.currentUser.user?.id,
            modifiedUser: this.currentUser.user?.id
        });

        return {
            project,
            workflow
        };
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
            isEditing: false,
            isLoading: false,
            errors: []
        });
    }

    /**
     * Actions for the route
     */
    actions = {
        /**
         * Handle successful workflow creation
         * 
         * @param {Object} workflow The created workflow
         */
        workflowCreated(workflow) {
            this.router.transitionTo('app.project.workflows.edit', workflow.id);
        },

        /**
         * Handle workflow creation cancellation
         */
        cancelCreate() {
            this.router.transitionTo('app.project.workflows.index');
        },

        /**
         * Handle errors during workflow creation
         * 
         * @param {Error} error The error that occurred
         */
        error(error) {
            console.error('Workflow creation error:', error);
            
            const controller = this.controllerFor('app.project.workflows.create');
            controller.set('errors', [error.message || 'Failed to create workflow']);
        }
    };
}
