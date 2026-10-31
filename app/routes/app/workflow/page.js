/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* global Logger */
import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';

/**
 * The editor of a saved workflow: the workflow, its graph and the projects it can be scoped to
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Workflow
 * @extends App
 */
export default class AppWorkflowPageRoute extends App {
    /**
     * @property workflowGraph
     * @type Ember.Service
     * @public
     */
    @service workflowGraph;

    /**
     * Sends the user to access denied when their role cannot open the route, once the app data (and so the
     * user's permissions) have been loaded.
     *
     * @method beforeModel
     * @param {Transition} transition
     * @public
     */
    beforeModel(transition) {
        super.beforeModel(transition);

        if (this.controllerFor('app.loading-assets').get('dataLoaded')
            && !this.acl.hasRouteAccess(this.routeName)) {
            this.router.transitionTo('app.access-denied');
        }
    }

    /**
     * Loads the workflow and its graph
     *
     * @method model
     * @param {Object} params
     * @returns {Promise}
     */
    async model(params) {
        Logger.debug('AppWorkflowPageRoute::model');
        try {
            let [workflow, graph, projects] = await Promise.all([
                this.store.findRecord('workflow', params.workflow_id, { reload: true }),
                this.workflowGraph.load(params.workflow_id),
                this.loadProjects()
            ]);
            return { workflow, graph, projects };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }
    }

    /**
     * The projects a workflow can be scoped to
     *
     * @method loadProjects
     * @returns {Promise} resolves to an array of projects
     * @protected
     */
    async loadProjects() {
        let projects = await this.store.query('project', {
            fields: 'Project.id,Project.name',
            sort: 'Project.name',
            order: 'ASC',
            limit: -1
        });
        return projects.toArray();
    }

    /**
     * Starts the editor with nothing selected and names the breadcrumb after the workflow
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model
     * @private
     */
    setupController(controller, model) {
        controller.model = model;
        controller.selectedNode = null;
        this.breadcrumb.setTitle(this.routeName, model?.workflow?.name);
    }
}
