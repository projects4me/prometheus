/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The route shown when no idea is selected
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Project.Idea
 * @extends App
 */
export default class AppProjectIdeaIndexRoute extends App {
    /**
     * Clears the selection in the idea browser
     *
     * @method setupController
     * @private
     */
    setupController() {
        this.controllerFor('app.project.idea').selectedIdeaId = null;
    }

    /**
     * Opens the new idea page for the users who can start an idea, the others keep the hint
     *
     * @method redirect
     * @private
     */
    redirect() {
        if (this.acl.checkAccess('idea.create')) {
            this.transitionTo('app.project.idea.create');
        }
    }
}
