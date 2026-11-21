/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppWorkspacesCreateController from 'prometheus/controllers/app/workspaces/create';

/**
 * The controller of the workspace edit form. The create controller is reused, so Ember finds it on reload.
 *
 * @class AppWorkspacesEditController
 * @namespace Prometheus.Controllers
 * @module App.Workspaces
 * @extends AppWorkspacesCreateController
 */
export default class AppWorkspacesEditController extends AppWorkspacesCreateController {
    layoutName = 'edit';

    /**
     * Goes back to the Overview of the workspace, dropping the unsaved changes
     *
     * @method afterCancel
     * @param {Workspace} model
     * @protected
     */
    afterCancel(model) {
        let shortCode = model.shortCode;
        model.rollbackAttributes();
        this.router.transitionTo('app.workspace', shortCode);
    }
}
