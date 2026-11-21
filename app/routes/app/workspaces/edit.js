/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { objectAt } from 'prometheus/utils/array/object-at';

/**
 * The route that edits a workspace, it is also the sidebar's Workspace > Settings entry
 *
 * @class Edit
 * @namespace Prometheus.Routes.Workspaces
 * @module App.Workspaces
 * @extends App
 */
export default class AppWorkspacesEditRoute extends App {
    templateName = 'app/workspaces/create';

    async model(params) {
        try {
            let workspaces = await this.store.query('workspace', {
                query: `((Workspace.shortCode : ${params.shortcode}))`,
                limit: 1
            });
            let workspace = objectAt(workspaces, 0);
            if (!workspace) {
                this.transitionTo('app.workspaces');
            }
            return workspace;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workspace' });
        }
    }

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('message', {});
    }

    /**
     * Drops unsaved changes when the user leaves
     *
     * @method resetController
     * @param {Controller} controller
     */
    resetController(controller) {
        controller.model?.rollbackAttributes?.();
    }
}
