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
        return this.loadIdeas();
    }

    /**
     * Queries the ideas of the selected project, the newest updated first.
     *
     * @method loadIdeas
     * @returns {Promise}
     * @public
     */
    async loadIdeas() {
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
     * Queries the plans of the given ideas in one request.
     *
     * @method loadPlans
     * @param {Array} ideaIds
     * @returns {Promise}
     * @public
     */
    async loadPlans(ideaIds) {
        if (!ideaIds.length) {
            return [];
        }
        let conditions = ideaIds.map(id => `(Ideaplan.ideaId : ${id})`).join(' OR ');
        try {
            return await this.store.query('ideaplan', { query: `(${conditions})`, limit: -1 });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
            return null;
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
        controller.loadPlanStatuses(controller.ideas, ids => this.loadPlans(ids));
        controller.registerHermesIntents(this.trackedProject.getProjectId(), () => this.loadIdeas(), ids => this.loadPlans(ids));
    }

    /**
     * Disposes the Hermes registration when leaving the ideas
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        if (isExiting) {
            controller.view = null;
            controller.unregisterHermesIntents();
        }
    }
}
