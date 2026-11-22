/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppWorkspacesCreateController from 'prometheus/controllers/app/workspaces/create';

/**
 * The controller of the Projects tab of the workspace Settings, it saves the workspace details. The create
 * controller's validations and Gaia error handling are reused.
 *
 * @class WorkspaceSettingsProjectsController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppWorkspacesCreateController
 */
export default class WorkspaceSettingsProjectsController extends AppWorkspacesCreateController {
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
