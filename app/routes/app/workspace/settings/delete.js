/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The Delete tab of the workspace Settings.
 *
 * @class Delete
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsDeleteRoute extends App {
    model() {
        return this.modelFor('app.workspace.settings');
    }

    setupController(controller, model) {
        controller.set('model', model.workspace);
        controller.set('confirmingDelete', false);
        controller.set('deleteErrors', []);
    }
}
