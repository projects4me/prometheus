/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';

/**
 * The ideas route, it loads the ideas of the selected project for the idea browser
 *
 * @class Idea
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends App
 */
export default class AppProjectIdeaRoute extends App {
    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * Loads the ideas of the selected project, the newest updated first.
     *
     * @method model
     * @returns {Promise}
     */
    async model() {
        Logger.debug('AppProjectIdeaRoute::model');
        let projectId = this.trackedProject.getProjectId();
        try {
            return await this.store.query('idea', {
                query: `(Idea.projectId : ${projectId})`,
                sort: 'Idea.dateModified',
                order: 'DESC',
                limit: -1
            });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Hands the ideas to the controller.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Array} model
     * @private
     */
    setupController(controller, model) {
        controller.ideas = model ? model.toArray() : [];
    }
}
