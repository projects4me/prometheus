/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * Opens the default tab of the Settings page.
 *
 * @class Index
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsIndexRoute extends App {
    redirect() {
        this.router.replaceWith('app.workspace.settings.projects');
    }
}
