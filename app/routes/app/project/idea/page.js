/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';

/**
 * The route of one idea, its conversation and plan boxes are built by separate issues
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Project.Idea
 * @extends App
 */
export default class AppProjectIdeaPageRoute extends App {
    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * Loads the idea of the selected project
     *
     * @method model
     * @param {Object} params
     * @returns {Promise}
     */
    async model(params) {
        Logger.debug('AppProjectIdeaPageRoute::model');
        let projectId = this.trackedProject.getProjectId();
        try {
            let ideas = await this.store.query('idea', {
                query: `((Idea.id : ${params.idea_id}) AND (Idea.projectId : ${projectId}))`,
                limit: -1
            });
            return ideas.objectAt(0);
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Highlights the idea in the browser and names the breadcrumb after it
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Prometheus.Models.Idea} model
     * @private
     */
    setupController(controller, model) {
        this.controllerFor('app.project.idea').selectedIdeaId = model?.id ?? null;
        this.breadcrumb.setTitle(this.routeName, model?.title);
        this.breadcrumb.setIcon(this.routeName, 'lightbulb-o');
    }
}
