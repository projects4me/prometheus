/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The old edit URL of a workspace, it lands on the Settings page.
 *
 * @class Edit
 * @namespace Prometheus.Routes.Workspaces
 * @module App.Workspaces
 * @extends App
 */
export default class AppWorkspacesEditRoute extends App {
    redirect(model, transition) {
        this.router.replaceWith('app.workspace.settings', transition.to.params.shortcode);
    }
}
