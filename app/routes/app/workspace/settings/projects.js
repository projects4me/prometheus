/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The Projects tab of the workspace Settings, it edits the workspace the Settings page loaded.
 *
 * @class Projects
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsProjectsRoute extends App {
    model() {
        return this.modelFor('app.workspace.settings');
    }

    setupController(controller, model) {
        controller.set('model', model.workspace);
        controller.set('message', {});
    }
}
