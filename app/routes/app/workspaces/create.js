/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The route that creates a workspace
 *
 * @class Create
 * @namespace Prometheus.Routes.Workspaces
 * @module App.Workspaces
 * @extends App
 */
export default class AppWorkspacesCreateRoute extends App {

    model() {
        return this.store.createRecord('workspace');
    }

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('message', {});
    }

    /**
     * Drops the record when it was never saved
     *
     * @method resetController
     * @param {Controller} controller
     */
    resetController(controller) {
        if (controller.model && controller.model.isNew) {
            controller.model.destroyRecord();
        }
    }
}
