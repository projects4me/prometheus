/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { service } from '@ember/service';
import App from 'prometheus/routes/app';
import { objectAt } from 'prometheus/utils/array/object-at';
import { setWorkspaceBreadcrumb } from 'prometheus/utils/workspace/breadcrumb';

/**
 * The route of the workspace Settings page, it loads the workspace its tabs share.
 *
 * @class Settings
 * @namespace Prometheus.Routes.Workspace
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsRoute extends App {
    @service trackedProject;

    /**
     * Loads the workspace by its short code. Resolves to `{ notFound: true }` when there is none and to
     * `{ failed: true }` when the query fails.
     *
     * @method model
     * @return {Object}
     * @protected
     */
    async model() {
        let shortCode = this.paramsFor('app.workspace').shortcode;
        try {
            let workspaces = await this.store.query('workspace', {
                query: `((Workspace.shortCode : ${shortCode}))`,
                rels: 'manager',
                limit: 1
            });
            let workspace = objectAt(workspaces, 0);
            if (!workspace) {
                return { notFound: true };
            }
            setWorkspaceBreadcrumb(this.breadcrumb, this.trackedProject, workspace);
            return { workspace };
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { failed: true };
        }
    }

    /**
     * Hands the loaded model to the controller, the base route's setupController doesn't.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App} controller
     * @param {Object} model
     * @protected
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        controller.set('model', model);
    }

    /**
     * Drops unsaved changes of the details form when the user leaves the page
     *
     * @method resetController
     * @param {Prometheus.Controllers.App} controller
     * @param {Boolean} isExiting
     */
    resetController(controller, isExiting) {
        let workspace = controller.model?.workspace;
        if (isExiting && workspace && !workspace.isDestroying && !workspace.isDestroyed && workspace.hasDirtyAttributes) {
            workspace.rollbackAttributes();
        }
    }
}
