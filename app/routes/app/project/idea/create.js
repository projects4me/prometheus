/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';

/**
 * The route of the new idea page, it prepares the idea that the form fills
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Project.Idea
 * @extends App
 */
export default class AppProjectIdeaCreateRoute extends App {
    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * Clears the selection in the idea browser and hands a new idea to the form
     *
     * @method setupController
     * @param {Controller} controller
     * @private
     */
    setupController(controller) {
        this.controllerFor('app.project.idea').selectedIdeaId = null;
        controller.model = this.store.createRecord('idea', {
            projectId: this.trackedProject.getProjectId(),
            status: 'open'
        });
    }

    /**
     * Drops the idea that was never started
     *
     * @method resetController
     * @param {Controller} controller
     * @private
     */
    resetController(controller) {
        if (controller.model?.isNew) {
            controller.model.rollbackAttributes();
        }
    }
}
