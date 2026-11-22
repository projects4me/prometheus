/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { objectAt } from 'prometheus/utils/array/object-at';

/**
 * The read-only workspace Overview route
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceIndexRoute extends App {

    /**
     * Loads the workspace and its projects (the members are paged by the controller). Resolves to `{ notFound: true }` when no workspace has the
     * short code and to `{ failed: true }` when a query fails. Projects cover what the viewer can read.
     *
     * @method model
     * @param {Object} params
     * @return {Object}
     * @protected
     */
    async model() {
        let shortCode = this.paramsFor('app.workspace').shortcode;
        let workspace;
        let projects;
        try {
            let workspaces = await this.store.query('workspace', {
                query: `((Workspace.shortCode : ${shortCode}))`,
                rels: 'createdBy',
                limit: 1
            });
            workspace = objectAt(workspaces, 0);
            if (!workspace) {
                return { notFound: true };
            }

            projects = await this.store.query('project', {
                query: `((Project.workspaceId : ${workspace.id}))`,
                limit: -1
            });
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { failed: true };
        }

        this.breadcrumb.setTitle('app.workspace', workspace.name);
        return { workspace, projects: projects.slice() };
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
        if (model.workspace) {
            controller.loadMembers(0);
        }
    }
}
