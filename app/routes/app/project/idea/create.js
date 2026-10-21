/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The route of the new idea page, its form is built by a separate issue
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Project.Idea
 * @extends App
 */
export default class AppProjectIdeaCreateRoute extends App {
    /**
     * Clears the selection in the idea browser
     *
     * @method setupController
     * @private
     */
    setupController() {
        this.controllerFor('app.project.idea').selectedIdeaId = null;
    }
}
